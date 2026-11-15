from datetime import date, datetime, timezone
import logging
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.portfolio import PortfolioHolding
from app.schemas.portfolio import (
    PortfolioCreate,
    PortfolioHoldingOut,
    PortfolioSummary,
    PortfolioUpdate,
)
from app.services.stock_service import stock_service

logger = logging.getLogger(__name__)


class PortfolioService:
    def _enrich_holding(self, holding: PortfolioHolding) -> PortfolioHoldingOut:
        """Enrich a DB holding with real-time market data and calculated metrics."""
        try:
            quote = stock_service.get_quote(holding.symbol)
            current_price = quote.current_price
            day_change = quote.change
            day_change_pct = quote.percent_change
        except Exception as e:
            logger.warning(f"Error getting quote for holding {holding.symbol}: {e}")
            current_price = holding.purchase_price
            day_change = 0.0
            day_change_pct = 0.0

        invested_value = holding.quantity * holding.purchase_price
        current_value = holding.quantity * current_price
        gain_loss = current_value - invested_value
        gain_loss_percent = (gain_loss / invested_value * 100.0) if invested_value > 0 else 0.0

        return PortfolioHoldingOut(
            id=holding.id,
            user_id=holding.user_id,
            symbol=holding.symbol,
            company_name=holding.company_name or holding.symbol,
            quantity=holding.quantity,
            purchase_price=round(holding.purchase_price, 2),
            purchase_date=holding.purchase_date,
            notes=holding.notes,
            created_at=holding.created_at,
            updated_at=holding.updated_at,
            current_price=round(current_price, 2),
            current_value=round(current_value, 2),
            invested_value=round(invested_value, 2),
            gain_loss=round(gain_loss, 2),
            gain_loss_percent=round(gain_loss_percent, 2),
            day_change=round(day_change, 2),
            day_change_percent=round(day_change_pct, 2),
        )

    def get_user_holdings(self, db: Session, user_id: int) -> List[PortfolioHoldingOut]:
        holdings = (
            db.query(PortfolioHolding)
            .filter(PortfolioHolding.user_id == user_id)
            .order_by(PortfolioHolding.created_at.desc())
            .all()
        )
        return [self._enrich_holding(h) for h in holdings]

    def get_portfolio_summary(self, db: Session, user_id: int) -> PortfolioSummary:
        enriched_holdings = self.get_user_holdings(db, user_id)

        total_invested = sum(h.invested_value or 0.0 for h in enriched_holdings)
        total_current_value = sum(h.current_value or 0.0 for h in enriched_holdings)
        total_gain_loss = total_current_value - total_invested
        total_gain_loss_pct = (
            (total_gain_loss / total_invested * 100.0) if total_invested > 0 else 0.0
        )

        return PortfolioSummary(
            total_invested=round(total_invested, 2),
            total_current_value=round(total_current_value, 2),
            total_gain_loss=round(total_gain_loss, 2),
            total_gain_loss_percent=round(total_gain_loss_pct, 2),
            total_holdings_count=len(enriched_holdings),
            holdings=enriched_holdings,
        )

    def create_holding(
        self, db: Session, user_id: int, holding_in: PortfolioCreate
    ) -> PortfolioHoldingOut:
        clean_symbol = holding_in.symbol.upper().strip()
        company_name = holding_in.company_name

        if not company_name:
            quote = stock_service.get_quote(clean_symbol)
            company_name = quote.company_name or clean_symbol

        new_holding = PortfolioHolding(
            user_id=user_id,
            symbol=clean_symbol,
            company_name=company_name,
            quantity=float(holding_in.quantity),
            purchase_price=float(holding_in.purchase_price),
            purchase_date=holding_in.purchase_date or date.today(),
            notes=holding_in.notes,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(new_holding)
        db.commit()
        db.refresh(new_holding)

        return self._enrich_holding(new_holding)

    def update_holding(
        self,
        db: Session,
        user_id: int,
        holding_id: int,
        holding_in: PortfolioUpdate,
    ) -> PortfolioHoldingOut:
        holding = (
            db.query(PortfolioHolding)
            .filter(
                PortfolioHolding.id == holding_id,
                PortfolioHolding.user_id == user_id,
            )
            .first()
        )
        if not holding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio holding not found",
            )

        if holding_in.quantity is not None:
            holding.quantity = float(holding_in.quantity)
        if holding_in.purchase_price is not None:
            holding.purchase_price = float(holding_in.purchase_price)
        if holding_in.purchase_date is not None:
            holding.purchase_date = holding_in.purchase_date
        if holding_in.notes is not None:
            holding.notes = holding_in.notes
        if holding_in.company_name is not None:
            holding.company_name = holding_in.company_name

        holding.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(holding)

        return self._enrich_holding(holding)

    def delete_holding(self, db: Session, user_id: int, holding_id: int) -> bool:
        holding = (
            db.query(PortfolioHolding)
            .filter(
                PortfolioHolding.id == holding_id,
                PortfolioHolding.user_id == user_id,
            )
            .first()
        )
        if not holding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio holding not found",
            )

        db.delete(holding)
        db.commit()
        return True


portfolio_service = PortfolioService()
