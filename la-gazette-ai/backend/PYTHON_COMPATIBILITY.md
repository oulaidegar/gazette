# Python 3.14 Compatibility Issue

## Problem

FastAPI dependencies (specifically `pydantic-core`) require Rust compiler to build on Python 3.14. Pre-built wheels are not yet available for Python 3.14.

## Solutions

### Option 1: Install Rust (Quick, ~5 minutes)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

Then retry:
```bash
cd /Users/louaimroueh/Desktop/La\ Gazette/la-gazette-ai/backend
source venv/bin/activate
pip install -r requirements-api.txt
```

### Option 2: Use Python 3.12 (Recommended)

Better package compatibility, no Rust required.

```bash
# Install Python 3.12 via Homebrew
brew install python@3.12

# Create new venv with Python 3.12
cd /Users/louaimroueh/Desktop/La\ Gazette/la-gazette-ai/backend
python3.12 -m venv venv-312
source venv-312/bin/activate
pip install -r requirements-api.txt
```

## Recommendation

**Use Option 2 (Python 3.12)** for better stability and compatibility with all packages.
