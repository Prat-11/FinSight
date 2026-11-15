from datetime import datetime, timezone
import logging
from typing import Any, Dict, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score

from app.analytics.indicators import calculate_macd, calculate_rsi, calculate_sma
from app.schemas.stock import MLPrediction

logger = logging.getLogger(__name__)

ML_DISCLAIMER = (
    "Disclaimer: FinSight machine learning predictions are algorithmic statistical models "
    "generated using historical price and volume signals. They do not constitute financial advice "
    "nor guarantee future market movements. Financial markets are subject to high volatility and risk."
)


def _prepare_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame]:
    """
    Build technical features for ML model from historical OHLCV data.
    Ensures strict time ordering and prepares the latest row for inference.
    """
    data = df.copy()
    if "date" in data.columns:
        data = data.sort_values("date").reset_index(drop=True)

    close = data["close"]
    n = len(close)

    # 1. Moving Average Ratios
    sma_20 = calculate_sma(close, 20)
    sma_50 = calculate_sma(close, 50)
    data["sma_ratio_20"] = close / sma_20.replace(0, np.nan)
    data["sma_ratio_50"] = close / sma_50.replace(0, np.nan)
    data["sma_20_50_ratio"] = sma_20 / sma_50.replace(0, np.nan)

    # 2. RSI
    data["rsi_14"] = calculate_rsi(close, 14)

    # 3. MACD Features
    macd_res = calculate_macd(close, 12, 26, 9)
    data["macd"] = macd_res["macd"]
    data["macd_signal"] = macd_res["signal"]
    data["macd_hist"] = macd_res["histogram"]

    # 4. Volatility & Returns
    data["volatility_20"] = close.rolling(window=20, min_periods=1).std() / close.replace(0, np.nan)
    data["return_5d"] = close.pct_change(5).fillna(0.0)
    data["return_10d"] = close.pct_change(10).fillna(0.0)

    # 5. Volume Change
    if "volume" in data.columns and not data["volume"].isna().all():
        vol_sma = data["volume"].rolling(window=20, min_periods=1).mean()
        data["volume_ratio"] = data["volume"] / vol_sma.replace(0, np.nan)
    else:
        data["volume_ratio"] = 1.0

    feature_cols = [
        "sma_ratio_20",
        "sma_ratio_50",
        "sma_20_50_ratio",
        "rsi_14",
        "macd",
        "macd_signal",
        "macd_hist",
        "volatility_20",
        "return_5d",
        "return_10d",
        "volume_ratio",
    ]

    # Target: 5-day ahead direction (1 = UP > 1%, -1 = DOWN < -1%, 0 = NEUTRAL)
    future_return = (close.shift(-5) - close) / close.replace(0, np.nan)

    conditions = [
        future_return > 0.01,
        future_return < -0.01,
    ]
    choices = [1, -1]  # 1: UP, -1: DOWN
    data["target"] = np.select(conditions, choices, default=0)

    # Latest row for current inference
    latest_feature_row = data[feature_cols].iloc[[-1]].fillna(0.0)

    # Historical training dataset (exclude last 5 rows where future target is not realized)
    train_data = data.iloc[:-5].dropna(subset=feature_cols + ["target"])
    X = train_data[feature_cols].fillna(0.0)
    y = train_data["target"].astype(int)

    return X, y, latest_feature_row


def predict_stock_trend(symbol: str, df: pd.DataFrame) -> MLPrediction:
    """
    Train a Random Forest Classifier using time-based splitting (no data leakage)
    and predict the trend direction for the upcoming period.
    """
    now = datetime.now(timezone.utc)
    label_map = {1: "UP", -1: "DOWN", 0: "NEUTRAL"}

    # Handle insufficient data edge case
    if df.empty or len(df) < 35:
        return MLPrediction(
            symbol=symbol,
            predicted_direction="NEUTRAL",
            confidence=0.50,
            accuracy=0.50,
            precision=0.50,
            recall=0.50,
            f1_score=0.50,
            feature_importances={
                "rsi_14": 0.25,
                "sma_ratio_20": 0.25,
                "macd": 0.25,
                "volatility_20": 0.25,
            },
            disclaimer=ML_DISCLAIMER,
            timestamp=now,
        )

    try:
        X, y, latest_row = _prepare_features(df)

        if len(X) < 25:
            return MLPrediction(
                symbol=symbol,
                predicted_direction="NEUTRAL",
                confidence=0.50,
                accuracy=0.50,
                precision=0.50,
                recall=0.50,
                f1_score=0.50,
                feature_importances=None,
                disclaimer=ML_DISCLAIMER,
                timestamp=now,
            )

        # Time-based train-test split (strictly past -> future, no shuffle)
        split_idx = int(len(X) * 0.8)
        # Ensure at least 5 test points
        split_idx = min(split_idx, len(X) - 5)
        split_idx = max(split_idx, 15)

        X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
        y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

        clf = RandomForestClassifier(
            n_estimators=100,
            max_depth=5,
            random_state=42,
            min_samples_split=4,
            class_weight="balanced"
        )
        clf.fit(X_train, y_train)

        # Evaluate on out-of-time test set
        y_pred_test = clf.predict(X_test)
        acc = float(accuracy_score(y_test, y_pred_test))
        prec = float(precision_score(y_test, y_pred_test, average="weighted", zero_division=0))
        rec = float(recall_score(y_test, y_pred_test, average="weighted", zero_division=0))
        f1 = float(f1_score(y_test, y_pred_test, average="weighted", zero_division=0))

        # Predict latest row
        pred_class = int(clf.predict(latest_row)[0])
        probabilities = clf.predict_proba(latest_row)[0]
        # Find probability corresponding to predicted class
        class_idx = list(clf.classes_).index(pred_class)
        confidence = float(probabilities[class_idx])

        # Feature importances
        feature_names = list(X.columns)
        importances = {
            f: round(float(imp), 4)
            for f, imp in zip(feature_names, clf.feature_importances_)
        }
        # Sort importances descending
        sorted_importances = dict(
            sorted(importances.items(), key=lambda item: item[1], reverse=True)[:6]
        )

        return MLPrediction(
            symbol=symbol,
            predicted_direction=label_map.get(pred_class, "NEUTRAL"),
            confidence=round(confidence, 3),
            accuracy=round(acc, 3),
            precision=round(prec, 3),
            recall=round(rec, 3),
            f1_score=round(f1, 3),
            feature_importances=sorted_importances,
            disclaimer=ML_DISCLAIMER,
            timestamp=now,
        )

    except Exception as exc:
        logger.error(f"Error executing ML prediction for {symbol}: {exc}")
        return MLPrediction(
            symbol=symbol,
            predicted_direction="NEUTRAL",
            confidence=0.50,
            accuracy=0.50,
            precision=0.50,
            recall=0.50,
            f1_score=0.50,
            feature_importances=None,
            disclaimer=ML_DISCLAIMER,
            timestamp=now,
        )
