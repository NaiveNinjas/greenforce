# Use official Python image
FROM registry.access.redhat.com/ubi9/python-312

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

USER root

# Set work directory
WORKDIR /app

# Copy project files
COPY pyproject.toml uv.lock ./

RUN chown -R 1001:0 /app

USER 1001

# Install dependencies
RUN uv sync --locked

COPY main.py orchestrate_agent.py ./

# Copy environment file
COPY .env .env

# Expose port
EXPOSE 8000

# Run FastAPI with uv
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
