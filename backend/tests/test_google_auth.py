from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)

def test_google_auth_demo_token():
    """Test the instant 1-click Google authentication flow."""
    res = client.post("/api/v1/auth/google", json={"credential": "demo-google-token-instant-auth"})
    assert res.status_code == 200, res.text
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "google.analyst@solvify.ai"
    assert data["user"]["role"] == "analyst"

def test_google_user_cannot_login_with_plain_password():
    """Verify that an account created via Google OAuth cannot be accessed via empty/random password."""
    # First ensure user exists
    client.post("/api/v1/auth/google", json={"credential": "demo-google-token-instant-auth"})
    
    # Try regular password login
    res = client.post("/api/v1/auth/login", json={
        "email": "google.analyst@solvify.ai",
        "password": "WrongPassword123!"
    })
    assert res.status_code == 400
    assert "Google Sign-In" in res.json()["detail"]

def test_google_auth_mocked_verified_token():
    """Test real verification path with mocked Google token info."""
    mock_id_info = {
        "email": "sarah.finance@example.com",
        "name": "Sarah Finance",
        "sub": "google-user-123456789",
        "aud": "mock-client-id"
    }

    with patch("google.oauth2.id_token.verify_oauth2_token", return_value=mock_id_info):
        res = client.post("/api/v1/auth/google", json={"credential": "valid-simulated-google-jwt"})
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["user"]["email"] == "sarah.finance@example.com"
        assert data["user"]["name"] == "Sarah Finance"
        assert "access_token" in data

def test_google_auth_invalid_token():
    """Test that an invalid token returns 401 Unauthorized."""
    with patch("google.oauth2.id_token.verify_oauth2_token", side_effect=ValueError("Token expired")):
        res = client.post("/api/v1/auth/google", json={"credential": "expired-google-token"})
        assert res.status_code == 401
        assert "Google authentication failed" in res.json()["detail"]
