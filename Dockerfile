# Dockerfile para Crediclass Dashboard Grupos Backend
# Deploy: Render.com (Python 3.11)

FROM python:3.11-slim

WORKDIR /app

# Definir PYTHONPATH para imports relativos
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements (layer caching)
COPY backend/requirements.txt ./requirements.txt

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código backend
COPY backend/ ./backend/

# Copiar dados (cache local sincronizado com Google Sheets)
COPY data/ ./data/

# Expor porta
EXPOSE 8000

# Comando de inicialização
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
