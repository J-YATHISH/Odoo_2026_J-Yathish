import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
import sys

app = FastAPI()

print("=====================================================")
print("⏳ Loading AI Model (This might take a minute...)")
print("=====================================================")
try:
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    print("✅ AI Model Loaded Successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    sys.exit(1)

class MaintenanceRequestPayload(BaseModel):
    issueDescription: str
    organizationId: int
    assetCategoryName: str

@app.post("/predict")
async def predict(payload: MaintenanceRequestPayload):
    text = payload.issueDescription
    print(f"\n[AI Processing] Received Request: '{text}'")
    
    # Priority Prediction
    pri_res = classifier(text, ["High", "Medium", "Low"])
    priority = pri_res['labels'][0]
    
    # Category Prediction
    cat_res = classifier(text, ["Hardware", "Software", "Network"])
    category = cat_res['labels'][0].upper()
    
    print(f"[AI Result] Priority: {priority} | Category: {category}")
    return {"priority": priority, "issueCategory": category}

if __name__ == "__main__":
    print("\n🚀 AI Server starting on http://localhost:8000")
    print("Update your server/.env file to: AI_MODEL_URL=http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
