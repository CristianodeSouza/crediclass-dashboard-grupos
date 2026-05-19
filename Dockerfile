# Dockerfile para Crediclass Dashboard Grupos
# Deploy: Render.com (Native Python 3.11 via Docker)

FROM python:3.11-slim

WORKDIR /app

# Definir PYTHONPATH para imports relativos
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Instalar dependências do sistema (se necessário)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements ANTES do código (layer caching)
COPY backend/requirements.txt ./backend/requirements.txt

# Instalar dependências Python
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copiar backend
COPY backend/ ./backend/

# Copiar frontend (CRÍTICO — contém app.js e index.html)
COPY frontend/ ./frontend/

# Copiar dados (CRÍTICO — evita "tela preta" em produção)
COPY data/ ./data/

# Expor porta
EXPOSE 8000

# Comando de inicialização
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
