# Agents Overview

This document describes the key **agents** (services and external systems) in the PR Tracker ecosystem. It is intended for general understanding and reference.

---

## 1. Front-End Clients

* **Technology**: React, Angular or any SPA framework
* **Purpose**: Provide user interface for developers to view and interact with:

  * User profile data
  * Repositories list
  * Pull request dashboards
  * Commit histories
  * Branch listings
* **Communication**: Calls BFF endpoints over HTTPS, using Bearer token authentication.

---

## 2. pr-tracker-bff (This Repository)

* **Type**: Backend-For-Frontend (BFF) service
* **Technology**: NestJS + TypeScript
* **Responsibilities**:

  1. **Proxy**: Mirror and expose REST endpoints to match front-end needs.
  2. **Validation**: Use `class-validator` to enforce DTO schemas.
  3. **Documentation**: Generate Swagger UI (`/api-docs`) via `@nestjs/swagger`.
  4. **Error Handling**: Global filters to translate errors (e.g., map downstream failures to 502).
  5. **Security Layers** (future): JWT validation, rate limiting, security headers.
  6. **Logging & Metrics**: Interceptors to log request timings.
  7. **Testing**: Unit tests (Jest) and E2E tests (Supertest) targeting ≥ 90% coverage.
  8. **CI/CD**: Dockerfile + GitHub Actions workflows (lint, test, build, deploy).
* **Implemented Endpoints**:

  * `GET /user` → `GET /api/v1/user`
  * (Next) `GET /user/repos`
* **Configuration**:

  * `.env`:

    * `BACKEND_URL` (e.g. `http://localhost:8080`)
    * `PORT` (defaults to 3000)
    * `JWT_SECRET` (for future JWT guard)

---

## 3. pr-tracker-backend

* **Type**: Java Spring Boot microservice
* **Technology**: Java 17, Spring Boot 3.x, Maven
* **Responsibilities**:

  1. **Data Aggregation**: Fetches data from GitHub API in real time.
  2. **OAuth / PAT**: Supports GitHub OAuth2 and Personal Access Tokens.
  3. **Endpoints**:

     * `/api/v1/user`
     * `/api/v1/user/repos`
     * `/api/v1/users/{username}/repos`
     * `/api/v1/orgs/{org}/repos`
     * `/api/v1/repos/{owner}/{repo}/pulls`
     * `/api/v1/repos/{owner}/{repo}/commits`
     * `/api/v1/repos/{owner}/{repo}/branches`
* **Stateless**: No local database; purely a proxy to GitHub API.

---

## 4. GitHub API

* **Type**: External REST API
* **Base URL**: `https://api.github.com`
* **Responsibilities**:

  * Provide user, repository, pull request, commit, and branch data.
  * Enforce GitHub rate limits and authentication scopes.

---

## 5. Interactions & Data Flow

1. **Client** → **BFF**: Sends HTTP request with `Authorization: Bearer <token>`.
2. **BFF** → **Backend**: Forwards header and parameters to Java service.
3. **Backend** → **GitHub**: Fetches data in real time.
4. **Response** travels back BFF → Client, with BFF handling validation, error mapping, and logging.

---

## 6. Future Agents (Planned)

* **Cache Layer** (Redis) for GET endpoints
* **Circuit Breaker** agent to prevent cascading failures
* **Monitoring & Tracing** (Prometheus, Jaeger)
* **Auth Service** for centralized token issuance and revocation

---

*Document generated for AI assistant’s context.*