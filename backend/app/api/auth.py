from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from app.security.auth import verify_password, get_password_hash, create_access_token, get_current_active_user
from app.config import settings
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    hashed_pwd = get_password_hash(payload.password)
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hashed_pwd
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user and not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account was registered with Google Sign-In. Please click 'Continue with Google' to sign in."
        )
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
        
    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)):
    return UserResponse.model_validate(current_user)


# ──────────────────────────────────────────────
# Google OAuth Sign-In & Instant Demo
# ──────────────────────────────────────────────
class GoogleAuthRequest(BaseModel):
    credential: str  # Google ID token from frontend


@router.post("/google", response_model=TokenResponse)
def google_auth(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Verify a Google ID token, create/fetch user, and return Solvify JWT."""
    # Fast path for developer demo / mock token
    if payload.credential.startswith("demo-google-token"):
        demo_google_email = "google.analyst@solvify.ai"
        demo_google_name = "Google Fast Analyst"
        user = db.query(User).filter(User.email == demo_google_email).first()
        if not user:
            user = User(
                name=demo_google_name,
                email=demo_google_email,
                password_hash=None,
                role="analyst"
            )
            try:
                db.add(user)
                db.commit()
                db.refresh(user)
            except Exception:
                db.rollback()
                user.password_hash = "!google_oauth_no_password"
                db.add(user)
                db.commit()
                db.refresh(user)

        token = create_access_token({"sub": user.id, "email": user.email})
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )

    client_id = (settings.GOOGLE_CLIENT_ID or "").strip().strip('"').strip("'") or None

    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        req = google_requests.Request()
        if client_id:
            try:
                id_info = id_token.verify_oauth2_token(
                    payload.credential,
                    req,
                    client_id
                )
            except ValueError as ve:
                # Check if audience is the mismatch
                try:
                    raw_info = id_token.verify_oauth2_token(payload.credential, req)
                    token_aud = raw_info.get("aud")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail=f"Google authentication client mismatch. Configured: '{client_id}', Token audience: '{token_aud}'."
                    )
                except HTTPException:
                    raise
                except Exception:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail=f"Google token verification failed: {str(ve)}"
                    )
        else:
            # When client_id is not yet defined in .env, verify Google token signature directly
            id_info = id_token.verify_oauth2_token(
                payload.credential,
                req
            )
    except HTTPException:
        raise
    except ImportError as ie:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server missing dependencies for Google Auth: {str(ie)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {str(e)}"
        )

    google_email = id_info.get("email")
    google_name = id_info.get("name", google_email.split("@")[0] if google_email else "Google User")

    if not google_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not retrieve email from Google account."
        )

    # Find or create user
    user = db.query(User).filter(User.email == google_email).first()
    if not user:
        user = User(
            name=google_name,
            email=google_email,
            password_hash=None,  # No local password for Google users
            role="user"
        )
        try:
            db.add(user)
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            user.password_hash = "!google_oauth_no_password"
            db.add(user)
            db.commit()
            db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/demo", response_model=TokenResponse)
def demo_login(db: Session = Depends(get_db)):
    """Instant 1-click login as Demo Analyst to save time."""
    demo_email = "analyst.demo@solvify.ai"
    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        user = User(
            name="Senior Risk Analyst (Demo)",
            email=demo_email,
            password_hash=get_password_hash("SolvifyDemoAnalyst2026!"),
            role="analyst"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

