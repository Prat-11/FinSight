import logging
from typing import List, Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.models.watchlist import WatchlistItem
from app.schemas.watchlist import WatchlistCreate, WatchlistItemOut
from app.services.watchlist_service import watchlist_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])


@router.get("", response_model=List[WatchlistItemOut])
def get_watchlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all symbols in the user watchlist enriched with current market prices."""
    return watchlist_service.list_watchlist(db, current_user.id)


@router.post("", response_model=WatchlistItemOut, status_code=status.HTTP_201_CREATED)
def add_to_watchlist(
    item_in: WatchlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a stock ticker to user's watchlist."""
    return watchlist_service.add_to_watchlist(db, current_user.id, item_in)


@router.delete("/{item_id}", status_code=status.HTTP_200_OK)
def remove_from_watchlist(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a symbol from user's watchlist by ID or symbol."""
    # Check if item_id is an integer or symbol
    try:
        numeric_id = int(item_id)
        watchlist_service.remove_from_watchlist(db, current_user.id, numeric_id)
    except ValueError:
        # It's a symbol like "AAPL"
        clean_sym = item_id.upper().strip()
        item = (
            db.query(WatchlistItem)
            .filter(
                WatchlistItem.user_id == current_user.id,
                WatchlistItem.symbol == clean_sym,
            )
            .first()
        )
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{clean_sym} not found in watchlist",
            )
        db.delete(item)
        db.commit()

    return {"success": True, "message": "Item removed from watchlist"}
