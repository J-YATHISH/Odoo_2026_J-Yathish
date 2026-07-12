import nbformat as nbf

nb = nbf.v4.new_notebook()

text_intro = """\
# AssetFlow - AI Triage Model (Google Colab Edition)
This notebook runs a free, open-source Zero-Shot NLP model (`facebook/bart-large-mnli`) to intelligently triage IT support tickets based on text, organization, and device category.

**Instructions:**
1. Upload this file to Google Colab.
2. Sign up for a free account at [ngrok.com](https://ngrok.com) and get your Authtoken.
3. Paste your Authtoken in Cell 4.
4. Click **Run All**.
5. Copy the public `ngrok.io` URL at the bottom and paste it into your Node.js backend `.env` file as `AI_MODEL_URL`!
"""

code_install = """\
!pip install transformers torch fastapi uvicorn pyngrok nest-asyncio pydantic
"""

code_model = """\
from transformers import pipeline

print("Loading Open-Source Model (this takes a minute)...")
# We use a Zero-Shot classification model which doesn't require training data!
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
print("Model loaded successfully!")
"""

code_test = """\
# Let's test the model's intelligence!
text = "My MacBook Pro 2022 screen is glitching."
candidate_labels = ["Hardware Issue", "Software Issue", "Network Issue", "High Priority", "Low Priority"]

result = classifier(text, candidate_labels)
print(f"Test Text: {text}")
print("Predictions:", list(zip(result['labels'], result['scores'])))
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
    
    # Predict Priority (Adding organization context could influence this in fine-tuned models)
    pri_result = classifier(context_text, ["High", "Medium", "Low"])
    predicted_priority = pri_result['labels'][0].upper()
    
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
print("Notebook generated successfully!")
