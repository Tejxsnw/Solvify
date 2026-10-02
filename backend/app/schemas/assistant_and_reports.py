from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ReportGenerateRequest(BaseModel):
    include_ratios: bool = True
    include_explanation: bool = True
    include_recommendations: bool = True
    include_scenarios: bool = True

class ReportResponse(BaseModel):
    report_id: str
    analysis_id: str
    download_url: str
    report_type: str
    file_size_kb: float
    created_at: datetime


class ChatMessagePayload(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class AssistantChatRequest(BaseModel):
    analysis_id: Optional[str] = None
    conversation_id: Optional[str] = None
    message: str
    context_snapshot: Optional[Dict[str, Any]] = None

class AssistantChatResponse(BaseModel):
    conversation_id: str
    reply: str
    suggested_followups: List[str]
    context_referenced: List[str]
    created_at: datetime
