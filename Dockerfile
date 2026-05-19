FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

EXPOSE 10000

CMD ["sh", "-c", "cd /app && python -m uvicorn backend.main:app --host 0.0.0.0 --port 10000"]
