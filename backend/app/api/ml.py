import logging
from fastapi import APIRouter, HTTPException, Query, status

from app.ml.predictor import predict_stock_trend
from app.schemas.stock import MLPrediction
from app.services.stock_service import stock_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ml", tags=["Machine Learning"])


@router.post("/predict/{symbol}", response_model=MLPrediction)
@router.get("/predict/{symbol}", response_model=MLPrediction)
def predict_stock(
    symbol: str,
    timeframe: str = Query(default="7D", description="Prediction timeframe: 7D, 14D, 30D"),
):
    """
    Run Random Forest statistical machine learning model to predict directional trend
    (UP / DOWN / NEUTRAL) along with out-of-time validation metrics and feature importances.
    """
    clean_sym = symbol.upper().strip()
    try:
        # Load 1 year of historical data for model training
        df = stock_service.get_history_df(clean_sym, period="1Y")
        prediction = predict_stock_trend(clean_sym, df)
        return prediction
    except Exception as exc:
        logger.error(f"Error predicting trend for {clean_sym}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to execute ML prediction for {clean_sym}: {str(exc)}",
        )
