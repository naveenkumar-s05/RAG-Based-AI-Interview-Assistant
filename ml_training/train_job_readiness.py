import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from xgboost import XGBClassifier
from pathlib import Path
import joblib

# Load the dataset we just created
data_path = "ml_training/xgboost_job_readiness_dataset.csv"
df = pd.read_csv(data_path)

features = [
    "technical_knowledge",
    "problem_solving",
    "logical_thinking",
    "programming_coding",
    "communication",
]
target = "job_readiness"

X = df[features]
y_text = df[target]

# Convert the four text classes to numeric labels for XGBoost
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(y_text)

# Stratified split keeps the four classes balanced in train/test sets
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

model = XGBClassifier(
    objective="multi:softprob",
    num_class=4,
    n_estimators=200,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.9,
    colsample_bytree=0.9,
    eval_metric="mlogloss",
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

pred = model.predict(X_test)

accuracy = accuracy_score(y_test, pred)

print("XGBoost Job Readiness Model")
print("=" * 40)
print(f"Training records : {len(X_train)}")
print(f"Testing records  : {len(X_test)}")
print(f"Features         : {len(features)}")
print(f"Accuracy         : {accuracy:.4f} ({accuracy * 100:.2f}%)")
print("\nClassification Report:")
print(classification_report(
    y_test,
    pred,
    target_names=label_encoder.classes_,
    digits=4
))

print("Confusion Matrix:")
print(confusion_matrix(y_test, pred))

# Save model + label encoder together for FastAPI integration
model_package = {
    "model": model,
    "label_encoder": label_encoder,
    "features": features,
}

model_path = Path("backend/ml/job_readiness_model.pkl")
joblib.dump(model_package, model_path)

print(f"\nSaved trained model to: {model_path}")

# Show feature importance
importance = pd.DataFrame({
    "feature": features,
    "importance": model.feature_importances_
}).sort_values("importance", ascending=False)

print("\nFeature Importance:")
print(importance.to_string(index=False))
