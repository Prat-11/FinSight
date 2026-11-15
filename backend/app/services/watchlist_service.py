from datetime import datetime, timezone
import logging
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.watchlist import WatchlistItem
from app.schemas.watchlist import WatchlistCreate, WatchlistItemOut
from app.services.stock_service import stock_service

logger = logging.getLogger(__name__)


class WatchlistService:
    def _enrich_watchlist_item(self, item: WatchlistItem) -> WatchlistItemOut:
        try:
            quote = stock_service.get_quote(item.symbol)
            current_price = quote.current_price
            change = quote.change
            percent_change = quote.percent_change
            day_high = quote.day_high
            day_low = quote.day_low
            volume = quote.volume
            company_name = item.company_name or quote.company_name
        except Exception as e:
            logger.warning(f"Error enriching watchlist item {item.symbol}: {e}")
            current_price = None
            change = None
            percent_change = None
            day_high = None
            day_low = None
            volume = None
            company_name = item.company_name or item.symbol

        return WatchlistItemOut(
            id=item.id,
            user_id=item.user_id,
            symbol=item.symbol,
            company_name=company_name,
            added_at=item.added_at,
            current_price=current_price,
            change=change,
            percent_change=percent_change,
            day_high=day_high,
            day_low=day_low,
            volume=volume,
        )

    def list_watchlist(self, db: Session, user_id: int) -> List[WatchlistItemOut]:
        items = (
            db.query(WatchlistItem)
            .filter(WatchlistItem.user_id == user_id)
            .order_by(WatchlistItem.added_at.desc())
            .all()
        )
        return [self._enrich_watchlist_item(item) for item in items]

    def add_to_watchlist(
        self, db: Session, user_id: int, item_in: WatchlistCreate
    ) -> WatchlistItemOut:
        clean_symbol = item_in.symbol.upper().strip()

        # Check existing
        existing = (
            db.query(WatchlistItem)
            .filter(
                WatchlistItem.user_id == user_id,
                WatchlistItem.symbol == clean_symbol,
            )
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{clean_symbol} is already in your watchlist.",
            )

        company_name = item_in.company_name
        if not company_name:
            quote = stock_service.get_quote(clean_symbol)
            company_name = quote.company_name or clean_symbol

        new_item = WatchlistItem(
            user_id=user_id,
            symbol=clean_symbol,
            company_name=company_name,
            added_at=datetime.now(timezone.utc),
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)

        return self._enrich_watchlist_item(new_item)

    def remove_from_watchlist(self, db: Session, user_id: int, item_id: int) -> bool:
        item = (
            db.query(WatchlistItem)
            .filter(
                WatchlistItem.id == item_id,
                WatchlistItem.user_id == user_id,
            )
            .first()
        )
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Watchlist item not found",
            )

        db.delete(item)
        db.commit()
        return True


watchlist_service = WatchlistService()
