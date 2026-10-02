import json
import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.config import settings
from app.schemas.assistant_and_reports import AssistantChatResponse

class AssistantService:
    @staticmethod
    async def chat(
        message: str,
        conversation_id: str,
        context_snapshot: Optional[Dict[str, Any]] = None
    ) -> AssistantChatResponse:
        """
        Handles contextual financial inquiries. If GEMINI_API_KEY is configured,
        queries the Gemini model; otherwise generates precise, context-grounded financial reasoning.
        """
        company_name = context_snapshot.get("company_name", "the company") if context_snapshot else "the company"
        ratios = context_snapshot.get("ratios", {}) if context_snapshot else {}
        prob = context_snapshot.get("risk_probability", None) if context_snapshot else None
        band = context_snapshot.get("risk_band", None) if context_snapshot else None
        
        # If Gemini API Key is available, invoke Gemini
        if settings.GEMINI_API_KEY:
            try:
                system_prompt = (
                    "You are Solvify AI, a senior corporate financial analyst and risk consultant. "
                    "Analyze the company's distress risk strictly based on the supplied financial metrics. "
                    "Never invent missing values. Differentiate between statistical model predictions and formal advice."
                )
                context_str = json.dumps(context_snapshot or {}, indent=2)
                user_prompt = f"Company Financial Context:\n{context_str}\n\nUser Question: {message}"
                
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}",
                        json={
                            "system_instruction": {"parts": [{"text": system_prompt}]},
                            "contents": [{"parts": [{"text": user_prompt}]}]
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        reply_text = data["candidates"][0]["content"]["parts"][0]["text"]
                        return AssistantChatResponse(
                            conversation_id=conversation_id,
                            reply=reply_text,
                            suggested_followups=[
                                f"What immediate steps reduce {company_name}'s leverage?",
                                f"How does a 10% revenue drop affect our risk probability?",
                                "Explain the key drivers behind the Altman Z-Score."
                            ],
                            context_referenced=list(ratios.keys()),
                            created_at=datetime.utcnow()
                        )
            except Exception as e:
                # Fall back to local contextual reasoning
                pass

        # Context-Grounded Intelligent Rule/Reasoning Engine
        msg_lower = message.lower()
        context_keys_used = []

        if "liquidity" in msg_lower or "cash" in msg_lower or "current ratio" in msg_lower:
            cr = ratios.get("current_ratio", 0)
            qr = ratios.get("quick_ratio", 0)
            wc = ratios.get("working_capital", 0)
            context_keys_used.extend(["current_ratio", "quick_ratio", "working_capital"])
            reply = (
                f"**Liquidity Analysis for {company_name}:**\n\n"
                f"- **Current Ratio:** `{cr:.2f}x` (Target benchmark: > 1.50x)\n"
                f"- **Quick Ratio:** `{qr:.2f}x` (Target benchmark: > 1.00x)\n"
                f"- **Net Working Capital:** `${wc:,.0f}`\n\n"
                + ("⚠️ The company has tight working capital coverage, meaning short-term assets may not smoothly cover near-term obligations without steady cash inflows." 
                   if cr < 1.3 else 
                   "✅ Liquidity reserves are sufficient to absorb routine short-term operational fluctuations.")
            )
        elif "debt" in msg_lower or "leverage" in msg_lower or "solvency" in msg_lower:
            de = ratios.get("debt_to_equity", 0)
            da = ratios.get("debt_to_assets", 0)
            cf_debt = ratios.get("operating_cash_flow_to_debt", 0)
            context_keys_used.extend(["debt_to_equity", "debt_to_assets", "operating_cash_flow_to_debt"])
            reply = (
                f"**Capital Structure & Solvency for {company_name}:**\n\n"
                f"- **Debt-to-Equity:** `{de:.2f}x`\n"
                f"- **Debt-to-Assets:** `{da:.2f}x`\n"
                f"- **Cash Flow to Debt:** `{cf_debt:.2f}x`\n\n"
                + (f"The leverage profile presents significant risk. With debt representing {da*100:.1f}% of assets, servicing debt during a revenue contraction will stress operating margins."
                   if de > 2.0 else
                   "The company maintains a manageable leverage ratio with debt well-balanced against equity cushions.")
            )
        elif "altman" in msg_lower or "z-score" in msg_lower:
            z = ratios.get("altman_z_score", 0)
            zone = ratios.get("altman_zone", "N/A")
            context_keys_used.extend(["altman_z_score", "altman_zone"])
            reply = (
                f"**Altman Z-Score Breakdown:**\n\n"
                f"The Altman Z-Score for {company_name} is `{z:.2f}`, placing it in the **{zone} Zone**.\n\n"
                f"- **> 2.99:** Safe Zone (Low distress probability)\n"
                f"- **1.81 - 2.99:** Grey Zone (Moderate vulnerability)\n"
                f"- **< 1.81:** Distress Zone (High probability of default/distress within 24 months)\n\n"
                f"This composite metric evaluates working capital, cumulative earnings, operating profitability, capital structure, and asset efficiency."
            )
        elif "recommend" in msg_lower or "action" in msg_lower or "improve" in msg_lower:
            reply = (
                f"**Strategic Priority Recommendations for {company_name}:**\n\n"
                "1. **Accelerate Working Capital Inflows:** Implement structured early payment discounts for customers to convert accounts receivable faster.\n"
                "2. **Restructure High-Cost Debt:** Shift variable short-term credit lines into fixed longer-dated debt to safeguard cash flow.\n"
                "3. **Prune Low-Margin Lines:** Focus resources on product lines with positive gross contribution margins to protect net operating margins."
            )
        else:
            prob_str = f"{prob * 100:.1f}%" if prob is not None else "N/A"
            band_str = band if band else "N/A"
            reply = (
                f"**Solvify Analysis Summary for {company_name}:**\n\n"
                f"- **Estimated Distress Risk:** `{prob_str}` ({band_str} Risk Band)\n"
                f"- **Altman Z-Score:** `{ratios.get('altman_z_score', 'N/A')}` ({ratios.get('altman_zone', 'N/A')})\n"
                f"- **Current Ratio:** `{ratios.get('current_ratio', 'N/A')}x`\n"
                f"- **Debt-to-Equity:** `{ratios.get('debt_to_equity', 'N/A')}x`\n"
                f"- **Net Margin:** `{ratios.get('net_margin_pct', 'N/A')}%`\n\n"
                "You can ask me specific questions about liquidity, debt restructuring, margin improvements, or run What-If simulations to see the impact of revenue or debt adjustments."
            )

        return AssistantChatResponse(
            conversation_id=conversation_id,
            reply=reply,
            suggested_followups=[
                f"How can {company_name} improve its current ratio?",
                "What What-If scenario should we test first?",
                "Explain the debt-to-equity risks in detail."
            ],
            context_referenced=context_keys_used or ["company_name", "risk_probability"],
            created_at=datetime.utcnow()
        )
