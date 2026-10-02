import uuid
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.assistant_and_reports import AssistantChatRequest, AssistantChatResponse
from app.services.assistant_service import AssistantService

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])

@router.post("/chat", response_model=AssistantChatResponse)
async def chat_with_assistant(payload: AssistantChatRequest):
    conversation_id = payload.conversation_id or str(uuid.uuid4())
    response = await AssistantService.chat(
        message=payload.message,
        conversation_id=conversation_id,
        context_snapshot=payload.context_snapshot
    )
    return response
