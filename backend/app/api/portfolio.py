import logging
from typing import Any, Dict, List, Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.portfolio import (
    PortfolioCreate,
    PortfolioHoldingOut,
    PortfolioSummary,
    PortfolioUpdate,
)
from app.services.portfolio_service import portfolio_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.get("", response_model=PortfolioSummary)
def get_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve full portfolio summary with all active positions enriched with current prices."""
    return portfolio_service.get_portfolio_summary(db, current_user.id)


@router.get("/summary", response_model=PortfolioSummary)
def get_portfolio_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve portfolio metrics summary."""
    return portfolio_service.get_portfolio_summary(db, current_user.id)


@router.get("/holdings", response_model=List[PortfolioHoldingOut])
def get_portfolio_holdings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve list of user holdings enriched with live prices."""
    return portfolio_service.get_user_holdings(db, current_user.id)


@router.post("", response_model=PortfolioHoldingOut, status_code=status.HTTP_201_CREATED)
@router.post("/holdings", response_model=PortfolioHoldingOut, status_code=status.HTTP_201_CREATED)
def create_holding(
    holding_in: PortfolioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a new stock position to the user portfolio."""
    return portfolio_service.create_holding(db, current_user.id, holding_in)


@router.put("/{holding_id}", response_model=PortfolioHoldingOut)
@router.put("/holdings/{holding_id}", response_model=PortfolioHoldingOut)
def update_holding(
    holding_id: int,
    holding_in: PortfolioUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing portfolio holding."""
    return portfolio_service.update_holding(db, current_user.id, holding_id, holding_in)


@router.delete("/{holding_id}", status_code=status.HTTP_200_OK)
@router.delete("/holdings/{holding_id}", status_code=status.HTTP_200_OK)
def delete_holding(
    holding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a holding from the user portfolio."""
    portfolio_service.delete_holding(db, current_user.id, holding_id)
    return {"success": True, "message": "Holding deleted successfully"}
