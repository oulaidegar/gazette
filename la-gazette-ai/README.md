# Lebanese Gazette RAG Application

Production-grade RAG system for the Lebanese Official Gazette (2014-2025) with Arabic OCR, hybrid search, and RTL-native UI.

## Quick Start

### 1. Start Services
```bash
cd la-gazette-ai
docker-compose up -d
```

### 2. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your API keys:
# - GEMINI_API_KEY
# - COHERE_API_KEY
```

### 3. Process Test Data (Year 2025)
```bash
python workers/ocr_worker.py
```

## Architecture

- **OCR**: Gemini 2.0 Flash Vision (Arabic MSA optimized)
- **Database**: PostgreSQL + pgvector
- **Embeddings**: Cohere Multilingual v3
- **Search**: Hybrid (Semantic + BM25) with RRF
- **Backend**: FastAPI
- **Frontend**: Next.js + Tailwind (RTL-native)

## Project Structure

```
la-gazette-ai/
├── docker-compose.yml          # PostgreSQL, Qdrant, Redis
├── backend/
│   ├── init.sql               # Database schema
│   ├── requirements.txt       # Python dependencies
│   ├── workers/
│   │   └── ocr_worker.py     # Gemini Vision OCR
│   └── app/                   # FastAPI application (coming next)
└── frontend/                  # Next.js UI (coming next)
```

## Database Schema

### `issues` Table
- Stores gazette issue metadata
- Tracks OCR processing status

### `blocks` Table
- Individual text blocks with embeddings
- Bounding boxes for PDF navigation
- Confidence scores for quality control

## Next Steps

1. ✅ Initialize monorepo
2. ✅ Create Docker Compose
3. ✅ Build OCR worker
4. ⏳ Process first 10 PDFs
5. ⏳ Build FastAPI search API
6. ⏳ Create Next.js UI

See `implementation_plan.md` for detailed architecture.
