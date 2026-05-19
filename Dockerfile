# Use official Python 3.11 image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first (for better caching)
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy frontend code
COPY frontend/ ./frontend/

# Copy data (cache, auditoria, etc)
COPY data/ ./data/

# Set Python path to find modules
ENV PYTHONPATH=/app

# Expose port (Render will set PORT env var)
EXPOSE 8000

# Run FastAPI with uvicorn
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
