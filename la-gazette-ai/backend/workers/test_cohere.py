"""Test Cohere embedding generation"""
import os
from dotenv import load_dotenv
from pathlib import Path
import cohere

load_dotenv(Path(__file__).parent.parent / ".env")

cohere_key = os.getenv("COHERE_API_KEY")
print(f"Cohere API Key: {cohere_key[:10]}...")

client = cohere.ClientV2(api_key=cohere_key)
print("✅ Cohere client created")

# Test embedding
try:
    response = client.embed(
        texts=["مرحبا بك في الجريدة الرسمية"],
        model='embed-multilingual-v3.0',
        input_type='search_document',
        embedding_types=["float"]
    )
    print(f"✅ Embedding generated successfully!")
    print(f"Embedding dimension: {len(response.embeddings.float_[0])}")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
