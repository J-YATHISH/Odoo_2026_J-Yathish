import nbformat as nbf

nb = nbf.v4.new_notebook()

text_intro = """\
# AssetFlow - AI Triage Model (Google Colab Edition)
This notebook runs a free, open-source Zero-Shot NLP model (`facebook/bart-large-mnli`) to intelligently triage IT support tickets based on text, organization, and device category.

**Instructions:**
1. Upload this file to Google Colab.
2. Sign up for a free account at [ngrok.com](https://ngrok.com) and get your Authtoken.
3. Paste your Authtoken in the API cell at the bottom.
4. Click **Run All**.
5. Copy the public `ngrok.io` URL at the bottom and paste it into your Node.js backend `.env` file as `AI_MODEL_URL`!
"""

code_install = """\
!pip install transformers torch fastapi uvicorn pyngrok nest-asyncio pydantic scikit-learn matplotlib seaborn pandas
"""

code_model = """\
from transformers import pipeline

print("Loading Open-Source Model (this takes a minute)...")
# We use a Zero-Shot classification model which doesn't require training data!
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
print("Model loaded successfully!")
"""

code_test = """\
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, classification_report

print("Running Dynamic Data Testing & Accuracy Metrics...")

# Dynamic Mock Database of IT Tickets
# In a real scenario, this dynamic list can be populated directly from your Postgres DB via pandas/SQLAlchemy!
test_data = [
    {"text": "My MacBook Pro 2022 screen is glitching.", "true_category": "Hardware", "true_priority": "High"},
    {"text": "The warehouse forklift is leaking oil on the floor.", "true_category": "Hardware", "true_priority": "High"},
    {"text": "I can't access my email account, it says password incorrect.", "true_category": "Software", "true_priority": "Low"},
    {"text": "The wifi in conference room B keeps disconnecting.", "true_category": "Network", "true_priority": "Medium"},
    {"text": "My laptop keyboard has a stuck key.", "true_category": "Hardware", "true_priority": "Low"},
    {"text": "The main server rack is smoking!", "true_category": "Hardware", "true_priority": "High"},
    {"text": "VPN is down for the entire remote team.", "true_category": "Network", "true_priority": "High"},
    {"text": "Microsoft Word keeps crashing when I save.", "true_category": "Software", "true_priority": "Low"}
]

predicted_categories = []
true_categories = [d["true_category"] for d in test_data]
predicted_priorities = []
true_priorities = [d["true_priority"] for d in test_data]

# Run predictions dynamically against the AI Model
for item in test_data:
    # Category Prediction
    cat_res = classifier(item["text"], ["Hardware", "Software", "Network"])
    predicted_categories.append(cat_res['labels'][0])
    
    # Priority Prediction
    pri_res = classifier(item["text"], ["High", "Medium", "Low"])
    predicted_priorities.append(pri_res['labels'][0].capitalize())

# --- Generate Category Confusion Matrix ---
plt.figure(figsize=(6, 4))
cm_cat = confusion_matrix(true_categories, predicted_categories, labels=["Hardware", "Software", "Network"])
sns.heatmap(cm_cat, annot=True, fmt='d', cmap='Blues', xticklabels=["Hardware", "Software", "Network"], yticklabels=["Hardware", "Software", "Network"])
plt.title('Confusion Matrix: Issue Category (Zero-Shot AI)')
plt.xlabel('Predicted Category')
plt.ylabel('True Category')
plt.show()

print("\\nClassification Report (Category):")
print(classification_report(true_categories, predicted_categories, zero_division=0))

# --- Generate Priority Confusion Matrix ---
plt.figure(figsize=(6, 4))
cm_pri = confusion_matrix(true_priorities, predicted_priorities, labels=["High", "Medium", "Low"])
sns.heatmap(cm_pri, annot=True, fmt='d', cmap='Oranges', xticklabels=["High", "Medium", "Low"], yticklabels=["High", "Medium", "Low"])
plt.title('Confusion Matrix: Priority (Zero-Shot AI)')
plt.xlabel('Predicted Priority')
plt.ylabel('True Priority')
plt.show()

print("\\nClassification Report (Priority):")
print(classification_report(true_priorities, predicted_priorities, zero_division=0))
"""

code_api = """\
import nest_asyncio
from pyngrok import ngrok
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel

# ==========================================
# IMPORTANT: PASTE YOUR NGROK AUTHTOKEN HERE
# ==========================================
NGROK_AUTH_TOKEN = "PASTE_YOUR_TOKEN_HERE"
ngrok.set_auth_token(NGROK_AUTH_TOKEN)

app = FastAPI(title="AssetFlow AI Triage API")

class TriageRequest(BaseModel):
    issueDescription: str
    organizationId: int
    assetCategoryName: str

@app.post("/predict")
async def predict(data: TriageRequest):
    # We combine the context into a single smart sentence for the AI
    context_text = f"The user is reporting an issue for their {data.assetCategoryName}. They said: '{data.issueDescription}'"
    
    # Predict Category
    cat_result = classifier(context_text, ["Hardware", "Software", "Network"])
    predicted_category = cat_result['labels'][0]
    
    # Predict Priority
    pri_result = classifier(context_text, ["High", "Medium", "Low"])
    predicted_priority = pri_result['labels'][0].capitalize()
    
    return {
        "priority": predicted_priority,
        "issueCategory": predicted_category.upper()
    }

# Start ngrok tunnel
public_url = ngrok.connect(8000).public_url
print("*" * 50)
print(f"✅ YOUR PUBLIC AI URL IS: {public_url}/predict")
print("*" * 50)
print("PASTE THIS EXACT URL INTO YOUR NODE.JS .ENV FILE AS: AI_MODEL_URL")

# Apply asyncio patch for Colab and run server
nest_asyncio.apply()
uvicorn.run(app, host="0.0.0.0", port=8000)
"""

nb['cells'] = [
    nbf.v4.new_markdown_cell(text_intro),
    nbf.v4.new_code_cell(code_install),
    nbf.v4.new_code_cell(code_model),
    nbf.v4.new_code_cell(code_test),
    nbf.v4.new_code_cell(code_api)
]

with open('AssetFlow_AI_Triage.ipynb', 'w', encoding='utf-8') as f:
    nbf.write(nb, f)
print("Notebook generated successfully with Confusion Matrices!")
