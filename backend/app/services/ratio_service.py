from app.schemas.financial import FinancialInput, FinancialRatios

class RatioService:
    @staticmethod
    def calculate_ratios(data: FinancialInput) -> FinancialRatios:
        total_assets = max(data.total_assets, 1.0)
        current_liabilities = max(data.current_liabilities, 1.0)
        total_liabilities = max(data.total_liabilities, 1.0)
        revenue = max(data.revenue, 1.0)
        
        # Working Capital
        working_capital = data.current_assets - data.current_liabilities
        working_capital_to_assets = working_capital / total_assets
        
        # Liquidity
        current_ratio = data.current_assets / current_liabilities
        inventory = data.inventory or 0.0
        quick_assets = max(0.0, data.current_assets - inventory)
        quick_ratio = quick_assets / current_liabilities
        cash_ratio = data.cash / current_liabilities
        
        # Solvency & Leverage
        # Note: If equity is <= 0, debt-to-equity is severely impaired
        equity = data.equity
        if equity > 0:
            debt_to_equity = data.debt / equity
            financial_leverage = total_assets / equity
        else:
            debt_to_equity = data.debt / 1.0  # high risk representation
            financial_leverage = 99.0
            
        debt_to_assets = data.debt / total_assets
        equity_ratio = equity / total_assets
        
        # Profitability
        net_margin_pct = (data.net_income / revenue) * 100.0
        operating_margin_pct = (data.operating_income / revenue) * 100.0
        return_on_assets_pct = (data.net_income / total_assets) * 100.0
        return_on_equity_pct = (data.net_income / max(abs(equity), 1.0)) * 100.0
        asset_turnover = data.revenue / total_assets
        retained_earnings_to_assets = data.retained_earnings / total_assets
        ebit_to_assets = data.operating_income / total_assets
        
        # Cash Flow & Coverage
        total_debt = max(data.debt, 1.0)
        operating_cash_flow_to_debt = data.operating_cash_flow / total_debt
        
        interest = data.interest_expense or 0.0
        if interest > 0:
            interest_coverage = data.operating_income / interest
        else:
            interest_coverage = 99.0 if data.operating_income >= 0 else -10.0
            
        # Altman Z-Score calculation (manufacturing/general model standard formula)
        # Z = 1.2*X1 + 1.4*X2 + 3.3*X3 + 0.6*X4 + 0.999*X5
        # X1 = Working Capital / Total Assets
        # X2 = Retained Earnings / Total Assets
        # X3 = EBIT / Total Assets
        # X4 = Book/Market Equity / Total Liabilities
        # X5 = Sales / Total Assets
        x1 = working_capital_to_assets
        x2 = retained_earnings_to_assets
        x3 = ebit_to_assets
        x4 = equity / total_liabilities
        x5 = asset_turnover
        
        altman_z = (1.2 * x1) + (1.4 * x2) + (3.3 * x3) + (0.6 * x4) + (0.999 * x5)
        
        if altman_z > 2.99:
            altman_zone = "Safe"
        elif altman_z >= 1.81:
            altman_zone = "Grey"
        else:
            altman_zone = "Distress"
            
        return FinancialRatios(
            current_ratio=round(current_ratio, 3),
            quick_ratio=round(quick_ratio, 3),
            cash_ratio=round(cash_ratio, 3),
            working_capital=round(working_capital, 2),
            working_capital_to_assets=round(working_capital_to_assets, 4),
            debt_to_equity=round(debt_to_equity, 3),
            debt_to_assets=round(debt_to_assets, 3),
            financial_leverage=round(financial_leverage, 3),
            equity_ratio=round(equity_ratio, 3),
            net_margin_pct=round(net_margin_pct, 2),
            operating_margin_pct=round(operating_margin_pct, 2),
            return_on_assets_pct=round(return_on_assets_pct, 2),
            return_on_equity_pct=round(return_on_equity_pct, 2),
            asset_turnover=round(asset_turnover, 3),
            retained_earnings_to_assets=round(retained_earnings_to_assets, 4),
            ebit_to_assets=round(ebit_to_assets, 4),
            operating_cash_flow_to_debt=round(operating_cash_flow_to_debt, 3),
            interest_coverage=round(interest_coverage, 2),
            altman_z_score=round(altman_z, 2),
            altman_zone=altman_zone
        )
