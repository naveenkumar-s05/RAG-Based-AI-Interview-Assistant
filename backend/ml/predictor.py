from pathlib import Path
import joblib
import pandas as pd


# ---------------------------------------------------------
# LOAD TRAINED XGBOOST MODEL
# ---------------------------------------------------------

MODEL_PATH = (
    Path(__file__).resolve().parent
    / "job_readiness_model.pkl"
)

model_package = joblib.load(MODEL_PATH)

model = model_package["model"]
label_encoder = model_package["label_encoder"]
features = model_package["features"]


# ---------------------------------------------------------
# PREDICT JOB READINESS
# ---------------------------------------------------------

def predict_job_readiness(
    technical_knowledge,
    problem_solving,
    logical_thinking,
    programming_coding,
    communication
):
    """
    Predict candidate job readiness using
    the trained XGBoost model.
    """

    input_data = pd.DataFrame(
        [[
            technical_knowledge,
            problem_solving,
            logical_thinking,
            programming_coding,
            communication
        ]],
        columns=features
    )

    prediction = model.predict(input_data)[0]

    job_readiness = label_encoder.inverse_transform(
        [prediction]
    )[0]

    probabilities = model.predict_proba(
        input_data
    )[0]

    confidence = float(
        max(probabilities) * 100
    )

    return {
        "job_readiness": job_readiness,
        "confidence": round(confidence, 2)
    }