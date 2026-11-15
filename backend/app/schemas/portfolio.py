from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class PortfolioCreate(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=32)
    company_name: Optional[str] = Field(default=None, max_length=255)
    quantity: float = Field(..., gt=0)
    purchase_price: float = Field(..., ge=0)
    purchase_date: Optional[date] = None
    notes: Optional[str] = None


class PortfolioUpdate(BaseModel):
    quantity: Optional[float] = Field(default=None, gt=0)
    purchase_price: Optional[float] = Field(default=None, ge=0)
    purchase_date: Optional[date] = None
    notes: Optional[str] = None
    company_name: Optional[str] = Field(default=None, max_length=255)


class PortfolioHoldingOut(BaseModel):
    id: int
    user_id: int
    symbol: str
    company_name: str
    quantity: float
    purchase_price: float
    purchase_date: date
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # Calculated metrics enriched from market data
    current_price: Optional[float] = None
    current_value: Optional[float] = None
    invested_value: Optional[float] = None
    gain_loss: Optional[float] = None
    gain_loss_percent: Optional[float] = None
    day_change: Optional[float] = None
    day_change_percent: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class PortfolioSummary(BaseModel):
    total_invested: float
    total_current_value: float
    total_gain_loss: float
    total_gain_loss_percent: float
    total_holdings_count: int
    holdings: List[PortfolioHoldingOut]

    model_config = ConfigDict(from_attributes=True)
