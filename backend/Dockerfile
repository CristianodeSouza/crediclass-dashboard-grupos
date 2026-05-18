FROM python:3.11-slim

WORKDIR /app

# Copy everything first
COPY . .

# Install dependencies from backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Expose port
EXPOSE 8000

# Run the application from backend directory with PORT env var support
CMD ["sh", "-c", "cd backend && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
