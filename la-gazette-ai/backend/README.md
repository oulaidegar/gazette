# Lebanese Gazette Search API

FastAPI backend for semantic and keyword search of Lebanese Official Gazette documents.

## Features

- 🔍 **Hybrid Search**: Combines semantic and keyword search for best results
- 🧠 **Semantic Search**: Vector similarity using Cohere embeddings
- 📝 **Keyword Search**: PostgreSQL full-text search
- ⚡ **Fast**: Optimized with pgvector and GIN indexes
- 🌐 **RESTful API**: Clean, documented endpoints
- 🔒 **Type-safe**: Pydantic models for validation

## Setup

### 1. Install Dependencies

```bash
# Create virtual environment with Python 3.12
python3.12 -m venv venv-312
source venv-312/bin/activate

# Install packages
pip install -r requirements-api.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# Cohere
COHERE_API_KEY=your-cohere-key
```

### 3. Setup Database Functions

Run `supabase_search_functions.sql` in your Supabase SQL Editor to create the search functions and indexes.

### 4. Run the API

```bash
# Development
source venv-312/bin/activate
uvicorn app.main:app --reload --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### Search

**Hybrid Search** (recommended):
```bash
GET /api/v1/search?query=قوانين+الضرائب&limit=10
```

**Semantic Search**:
```bash
GET /api/v1/search/semantic?query=tax+laws&limit=10
```

**Keyword Search**:
```bash
GET /api/v1/search/keyword?query=المادة+123&limit=10
```

**Parameters**:
- `query` (required): Search query text
- `year` (optional): Filter by year (2014-2025)
- `issue_number` (optional): Filter by issue number
- `limit` (optional): Max results (1-50, default: 10)
- `offset` (optional): Pagination offset (default: 0)

### Issues

**List Issues**:
```bash
GET /api/v1/issues?year=2025&limit=100
```

**Get Issue**:
```bash
GET /api/v1/issues/{issue_id}
```

### Health

```bash
GET /health
```

## Documentation

Interactive API documentation available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configuration
│   ├── api/v1/
│   │   ├── search.py        # Search endpoints
│   │   └── issues.py        # Issue endpoints
│   ├── services/
│   │   ├── semantic_search.py
│   │   ├── keyword_search.py
│   │   └── hybrid_search.py
│   ├── db/
│   │   └── supabase.py      # Database client
│   └── models/
│       └── search.py        # Pydantic models
├── requirements-api.txt
├── supabase_search_functions.sql
└── .env
```

## Testing

```bash
# Test search endpoint
curl "http://localhost:8000/api/v1/search?query=الجريدة+الرسمية&limit=5"

# Test health check
curl "http://localhost:8000/health"
```

## Deployment

See deployment guide in `implementation_plan.md`.
