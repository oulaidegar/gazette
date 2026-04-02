"""
Test script to list available Gemini models
"""
import os
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load .env from parent directory
load_dotenv(Path(__file__).parent.parent / ".env")

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ GEMINI_API_KEY not found")
    exit(1)

# List available models
url = f"https://generativelanguage.googleapis.com/v1/models?key={api_key}"

response = requests.get(url)

if response.status_code == 200:
    models = response.json()
    print("✅ Available Gemini models:\n")
    for model in models.get('models', []):
        name = model.get('name', '')
        display_name = model.get('displayName', '')
        supported_methods = model.get('supportedGenerationMethods', [])
        
        if 'generateContent' in supported_methods:
            print(f"  • {name}")
            print(f"    Display: {display_name}")
            print(f"    Methods: {', '.join(supported_methods)}\n")
else:
    print(f"❌ Error: {response.status_code}")
    print(response.text)
