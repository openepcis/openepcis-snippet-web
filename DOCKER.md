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

## Version-Pinned Deployment

For production, always pin to a specific version instead of `latest`:

```bash
# Deploy a specific version
docker pull ghcr.io/openepcis/openepcis-snippet-web:1.0.0
docker run -p 3000:3000 ghcr.io/openepcis/openepcis-snippet-web:1.0.0
```

Docker Compose with pinned version:

```yaml
services:
  openepcis-snippet-web:
    image: ghcr.io/openepcis/openepcis-snippet-web:1.0.0
    ports:
      - "3000:3000"
    environment:
      - NUXT_PUBLIC_SNIPPET_API_URL=https://api.epcis.cloud
    restart: unless-stopped
```

Use `latest` only for development and staging environments.

## Rollback

Every tagged release produces an immutable container image. To rollback, redeploy the previous version:

```bash
# Rollback to a previous version
docker pull ghcr.io/openepcis/openepcis-snippet-web:1.0.0
docker run -p 3000:3000 ghcr.io/openepcis/openepcis-snippet-web:1.0.0
```

Available versions can be found on the [GitHub Releases](https://github.com/openepcis/openepcis-snippet-web/releases) page or the [Container Registry](https://github.com/openepcis/openepcis-snippet-web/pkgs/container/openepcis-snippet-web).

## GitHub Actions CI/CD

The container is automatically built on:

- Push to `main` branch
- Tagged releases (v\*)

Image tags created:

- `latest` - Latest from main branch (default)
- `main` - Latest from main branch
- `sha-<commit>` - Specific commit
- `1.0.0`, `1.0` - Semantic version tags (from `v1.0.0` git tag)

A [GitHub Release](https://github.com/openepcis/openepcis-snippet-web/releases) with auto-generated release notes is created for every version tag.

## Health Check

The container includes a health check that verifies the application is responding:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' <container_id>

# Manual health check
curl -f http://localhost:3000/ || exit 1
```
