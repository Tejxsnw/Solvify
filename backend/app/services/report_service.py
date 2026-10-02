import os
import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.models.analysis import Analysis

REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage", "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

class ReportService:
    @staticmethod
    def generate_pdf_report(analysis: Analysis) -> str:
        """
        Generates an authoritative, beautifully styled PDF executive report for an analysis.
        Returns the absolute file path of the generated PDF.
        """
        filename = f"Solvify_Report_{analysis.company_name.replace(' ', '_')}_{analysis.id[:8]}.pdf"
        file_path = os.path.join(REPORTS_DIR, filename)

        doc = SimpleDocTemplate(
            file_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#0f172a"),
            fontName="Helvetica-Bold"
        )
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#64748b"),
            fontName="Helvetica"
        )
        h2_style = ParagraphStyle(
            "SectionHeader",
            parent=styles["Heading2"],
            fontSize=13,
            leading=17,
            textColor=colors.HexColor("#1e293b"),
            fontName="Helvetica-Bold",
            spaceBefore=12,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            "BodyDark",
            parent=styles["Normal"],
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#334155"),
            fontName="Helvetica"
        )
        badge_style = ParagraphStyle(
            "BadgeStyle",
            parent=styles["Normal"],
            fontSize=11,
            leading=15,
            textColor=colors.HexColor("#ffffff"),
            fontName="Helvetica-Bold",
            alignment=1
        )

        story = []

        # 1. Header & Metadata
        story.append(Paragraph("SOLVIFY | FINANCIAL HEALTH & DISTRESS RISK REPORT", subtitle_style))
        story.append(Spacer(1, 4))
        story.append(Paragraph(f"{analysis.company_name} ({analysis.financial_year})", title_style))
        story.append(Paragraph(f"Generated on {datetime.utcnow().strftime('%B %d, %Y at %H:%M UTC')} | Model: {analysis.model_name} v{analysis.model_version}", subtitle_style))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceBefore=4, spaceAfter=12))

        # 2. Executive Summary / Risk Band Box
        band = analysis.risk_band
        prob_pct = f"{analysis.risk_probability * 100:.1f}%"
        
        if band == "LOW":
            band_color = colors.HexColor("#16a34a")
            band_text = "LOW DISTRESS RISK"
        elif band == "MEDIUM":
            band_color = colors.HexColor("#d97706")
            band_text = "MODERATE / ELEVATED RISK"
        else:
            band_color = colors.HexColor("#dc2626")
            band_text = "HIGH DISTRESS RISK"

        summary_table_data = [
            [
                Paragraph(f"<b>Estimated Bankruptcy Probability</b><br/><font size='18' color='{band_color.hexval()}'><b>{prob_pct}</b></font>", body_style),
                Paragraph(f"<b>Risk Classification</b><br/><font size='14' color='{band_color.hexval()}'><b>{band_text}</b></font>", body_style),
                Paragraph(f"<b>Altman Z-Score</b><br/><font size='16'><b>{analysis.ratios.get('altman_z_score', 'N/A')}</b> ({analysis.ratios.get('altman_zone', 'N/A')})</font>", body_style)
            ]
        ]
        summary_table = Table(summary_table_data, colWidths=[180, 180, 180])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('PADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 14))

        # 3. Key Financial Ratios Table
        story.append(Paragraph("Core Financial Ratios", h2_style))
        r = analysis.ratios
        ratios_data = [
            ["Metric Category", "Indicator", "Value", "Benchmark Target", "Status"],
            ["Liquidity", "Current Ratio", f"{r.get('current_ratio', 0):.2f}", "> 1.50x", "Adequate" if r.get('current_ratio', 0) >= 1.5 else "Constrained"],
            ["Liquidity", "Quick Ratio", f"{r.get('quick_ratio', 0):.2f}", "> 1.00x", "Adequate" if r.get('quick_ratio', 0) >= 1.0 else "Weak"],
            ["Leverage", "Debt to Equity", f"{r.get('debt_to_equity', 0):.2f}", "< 1.50x", "Sound" if r.get('debt_to_equity', 0) <= 1.5 else "High Leverage"],
            ["Profitability", "Net Margin (%)", f"{r.get('net_margin_pct', 0):.1f}%", "> 8.0%", "Profitable" if r.get('net_margin_pct', 0) > 0 else "Loss Making"],
            ["Profitability", "Return on Assets (%)", f"{r.get('return_on_assets_pct', 0):.1f}%", "> 5.0%", "Positive" if r.get('return_on_assets_pct', 0) > 0 else "Negative"],
            ["Coverage", "Operating Cash Flow / Debt", f"{r.get('operating_cash_flow_to_debt', 0):.2f}x", "> 0.20x", "Safe" if r.get('operating_cash_flow_to_debt', 0) >= 0.2 else "Vulnerable"],
            ["Coverage", "Interest Coverage", f"{r.get('interest_coverage', 0):.1f}x", "> 3.00x", "Sufficient" if r.get('interest_coverage', 0) >= 3.0 else "Tight"]
        ]
        ratios_table = Table(ratios_data, colWidths=[90, 150, 80, 110, 110])
        ratios_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 9),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('PADDING', (0,0), (-1,-1), 5),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ]))
        story.append(ratios_table)
        story.append(Spacer(1, 14))

        # 4. Model Factor Attributions
        story.append(Paragraph("Primary Prediction Drivers (Explainability)", h2_style))
        for factor in (analysis.explanation or [])[:4]:
            impact_text = "Increases Risk" if factor.get("impact") == "INCREASES_RISK" else "Reduces Risk"
            f_color = "#dc2626" if factor.get("impact") == "INCREASES_RISK" else "#16a34a"
            story.append(Paragraph(f"<b>• {factor.get('feature_label')}</b> — <font color='{f_color}'><b>{impact_text}</b></font>", body_style))
            story.append(Paragraph(f"&nbsp;&nbsp;&nbsp;{factor.get('explanation')}", subtitle_style))
            story.append(Spacer(1, 4))
            
        story.append(Spacer(1, 10))

        # 5. Targeted Recommendations
        story.append(Paragraph("Prioritized Actionable Recommendations", h2_style))
        for rec in (analysis.recommendations or [])[:3]:
            story.append(Paragraph(f"<b>[{rec.get('priority').upper()} PRIORITY] {rec.get('title')}</b> (Metric: {rec.get('metric')})", body_style))
            story.append(Paragraph(f"{rec.get('rationale')}", subtitle_style))
            actions_str = "<br/>".join([f"&nbsp;&nbsp;&nbsp;→ {act}" for act in rec.get("action_plan", [])])
            story.append(Paragraph(actions_str, body_style))
            story.append(Spacer(1, 6))

        # 6. Disclaimer
        story.append(Spacer(1, 14))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0"), spaceBefore=4, spaceAfter=8))
        disclaimer_text = (
            "<b>Disclaimer:</b> Solvify provides machine learning risk estimations for informational, benchmarking, and analytical "
            "purposes. It does not constitute formal auditing, investment advice, or guaranteed financial predictions."
        )
        story.append(Paragraph(disclaimer_text, subtitle_style))

        # Build PDF
        doc.build(story)
        return file_path
