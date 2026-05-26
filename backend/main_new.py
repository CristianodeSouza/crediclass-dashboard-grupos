"""
Entry point para a nova arquitetura FastAPI + Jinja2 + HTMX
Isso substitui o main.py anterior
"""
from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
