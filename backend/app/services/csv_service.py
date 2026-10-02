import io
import pandas as pd
from typing import List, Dict, Any, Tuple
from app.schemas.financial import FinancialInput

REQUIRED_COLUMNS = [
    "company_name",
    "revenue",
    "operating_income",
    "net_income",
    "total_assets",
    "current_assets",
    "cash",
    "total_liabilities",
    "current_liabilities",
    "debt",
    "equity",
    "operating_cash_flow"
]

OPTIONAL_COLUMNS = [
    "financial_year",
    "industry",
    "interest_expense",
    "inventory",
    "accounts_receivable",
    "long_term_debt",
    "retained_earnings"
]

class CSVService:
    @staticmethod
    def parse_and_validate_csv(file_content: bytes) -> Tuple[List[FinancialInput], List[Dict[str, Any]]]:
        """
        Parses uploaded CSV bytes, validates columns, data types, and value constraints.
        Returns (valid_records, validation_errors).
        """
        errors: List[Dict[str, Any]] = []
        valid_records: List[FinancialInput] = []

        try:
            df = pd.read_csv(io.BytesIO(file_content))
        except Exception as e:
            return [], [{"row": 0, "column": "file", "error": f"Failed to parse CSV file: {str(e)}"}]

        # Standardize column names (lowercase and strip whitespace)
        df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

        # Check missing required headers
        missing_headers = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing_headers:
            return [], [{
                "row": 0,
                "column": "headers",
                "error": f"Missing required headers: {', '.join(missing_headers)}"
            }]

        for idx, row in df.iterrows():
            row_num = idx + 2  # 1-indexed header + row
            row_dict = row.to_dict()

            # Handle NaN values for optional fields
            for opt in OPTIONAL_COLUMNS:
                if opt not in row_dict or pd.isna(row_dict[opt]):
                    if opt in ["interest_expense", "inventory", "accounts_receivable", "long_term_debt", "retained_earnings"]:
                        row_dict[opt] = 0.0
                    elif opt == "financial_year":
                        row_dict[opt] = "2025"
                    elif opt == "industry":
                        row_dict[opt] = "General"

            try:
                # Convert string fields
                if "company_name" in row_dict:
                    row_dict["company_name"] = str(row_dict["company_name"]).strip()
                if "financial_year" in row_dict:
                    row_dict["financial_year"] = str(row_dict["financial_year"]).strip()
                if "industry" in row_dict and not pd.isna(row_dict["industry"]):
                    row_dict["industry"] = str(row_dict["industry"]).strip()

                # Convert numbers
                for col in REQUIRED_COLUMNS + ["interest_expense", "inventory", "accounts_receivable", "long_term_debt", "retained_earnings"]:
                    if col not in ["company_name", "financial_year", "industry"]:
                        row_dict[col] = float(row_dict[col])

                fin_input = FinancialInput(**row_dict)
                valid_records.append(fin_input)
            except Exception as e:
                errors.append({
                    "row": row_num,
                    "company": str(row_dict.get("company_name", "Unknown")),
                    "error": str(e)
                })

        return valid_records, errors
