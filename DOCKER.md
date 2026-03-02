# Docker Build and Run Guide

This document explains how to build and run the OpenEPCIS Profile Checker container locally.

## Container Registry

Production images are automatically built by GitHub Actions and pushed to:

```
ghcr.io/openepcis/openepcis-snippet-web:latest
```

## Running Locally

### Option 1: Pull from GitHub Container Registry

```bash
# Pull the latest image
docker pull ghcr.io/openepcis/openepcis-snippet-web:latest

# Run with default settings (connects to https://api.epcis.cloud)
docker run -p 3000:3000 ghcr.io/openepcis/openepcis-snippet-web:latest

# Run with custom API URL
docker run -p 3000:3000 \
  -e NUXT_PUBLIC_SNIPPET_API_URL=http://localhost:8080 \
  ghcr.io/openepcis/openepcis-snippet-web:latest
```

Access the application at http://localhost:3000

### Option 2: Build Locally

```bash
# Build the image
docker build -t openepcis-snippet-web:local .

# Run the locally built image
docker run -p 3000:3000 openepcis-snippet-web:local

# Run with custom API URL
docker run -p 3000:3000 \
  -e NUXT_PUBLIC_SNIPPET_API_URL=http://localhost:8080 \
  openepcis-snippet-web:local
```

## Environment Variables

| Variable                      | Description                  | Default                 |
| ----------------------------- | ---------------------------- | ----------------------- |
| `NUXT_PUBLIC_SNIPPET_API_URL` | Backend API URL for snippets | `http://localhost:8090` |
| `HOST`                        | Host to bind to              | `0.0.0.0`               |
| `PORT`                        | Port to listen on            | `3000`                  |
| `NODE_ENV`                    | Node environment             | `production`            |

## Docker Compose Example

Create a `docker-compose.yml` file:

```yaml
version: "3.8"

services:
  openepcis-snippet-web:
    image: ghcr.io/openepcis/openepcis-snippet-web:latest
    ports:
      - "3000:3000"
    environment:
      - NUXT_PUBLIC_SNIPPET_API_URL=https://api.epcis.cloud
    restart: unless-stopped
```

Run with:

```bash
docker-compose up -d
```

## GitHub Actions CI/CD

The container is automatically built on:

- Push to `main` branch
- Tagged releases (v\*)

Image tags created:

- `latest` - Latest from main branch (default)
- `main` - Latest from main branch
- `sha-<commit>` - Specific commit
- `v1.0.0`, `v1.0` - Semantic version tags

## Health Check

The container includes a health check that verifies the application is responding:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' <container_id>

# Manual health check
curl -f http://localhost:3000/ || exit 1
```
