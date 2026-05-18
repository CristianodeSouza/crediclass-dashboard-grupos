FROM python:3.11-slim

WORKDIR /app

# Copy everything first
COPY . .

# Install dependencies from backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Ensure frontend directory is readable and all files have correct permissions
RUN if [ -d /app/frontend ]; then \
      chmod -R 755 /app/frontend && \
      find /app/frontend -type f -exec chmod 644 {} \;; \
    fi

# Expose port
EXPOSE 8000

# Force rebuild timestamp
# Built: 2025-05-18

# Run the application from backend directory with PORT env var support
CMD ["sh", "-c", "cd backend && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
