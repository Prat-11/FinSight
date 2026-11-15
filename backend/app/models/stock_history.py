from datetime import datetime, timezone
from sqlalchemy import Column, Date, DateTime, Float, Integer, String, UniqueConstraint

from app.database.base import Base


class StockHistory(Base):
    __tablename__ = "stock_histories"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(32), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint("symbol", "date", name="uq_symbol_date"),
    )
