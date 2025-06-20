# pr-tracker-bff

Backend-for-Frontend (BFF) service for the PR Tracker application, built with NestJS + TypeScript.

## Overview

This BFF sits between front-end clients and the `pr-tracker-backend` microservice. It exposes well-typed, documented REST endpoints that mirror those of the Java backend, performing validation, logging, error handling and potential caching or security layers.

## Features (implemented)

* **GET /user**

  * Forwards to `GET /api/v1/user` on pr-tracker-backend
  * Forwards `Authorization` header
  * Returns `{ login, name, avatarUrl, email }`
  * Input validation with `class-validator`
  * Swagger documentation via `@nestjs/swagger`
  * Unit tests (Jest) and E2E tests (Supertest)

## Prerequisites

* Node.js >= 18
* npm
* Docker (optional, for building images)

## Getting Started

1. **Clone repository**

   ```bash
   git clone https://github.com/<org>/pr-tracker-bff.git
   cd pr-tracker-bff
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # then edit .env as needed:
   # BACKEND_URL=http://localhost:8080
   # PORT=3000
   ```
4. **Start the pr-tracker-backend**

   ```bash
   # In the backend project folder:
   mvn spring-boot:run
   ```
5. **Run the BFF**

   ```bash
   npm run start:dev
   ```
6. **Open Swagger UI**

   ```
   ```

[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

```

## Environment Variables

| Variable    | Description                                | Default                 |
| ----------- | ------------------------------------------ | ----------------------- |
| BACKEND_URL | Base URL of pr-tracker-backend service     | `http://localhost:8080` |
| PORT        | Port for the BFF to listen on              | `3000`                  |
| JWT_SECRET  | (optional) Secret to validate JWT tokens   | —                       |

## Scripts

- `npm run start`       – start the compiled app (`dist`)
- `npm run start:dev`   – start in development mode with hot-reload
- `npm run build`       – compile source to `dist`
- `npm run test`        – run unit tests
- `npm run test:e2e`    – run end-to-end tests
- `npm run lint`        – run ESLint
- `npm run format`      – run Prettier

## Testing

- **Unit tests** live alongside source in `src/**/*.spec.ts`.
- **E2E tests** are in `test/**/*.e2e-spec.ts`.
- We aim for at least **90% coverage** on services and controllers.

## Roadmap

- [x] `GET /user`
- [ ] `GET /user/repos`
- [ ] `GET /users/:username/repos`
- [ ] `GET /orgs/:org/repos`
- [ ] `GET /repos/:owner/:repo/pulls`
- [ ] `GET /repos/:owner/:repo/commits`
- [ ] `GET /repos/:owner/:repo/branches`
- [ ] JWT validation guard
- [ ] Rate limiting (Throttler)
- [ ] Security headers (Helmet)
- [ ] Caching & Circuit Breaker
- [ ] Docker image & GitHub Actions CI/CD

## Contributing

Issues and pull requests are welcome. We follow **GitFlow** for branching:

1. `main` holds production code
2. `develop` for integration
3. feature branches named `feature/<name>`

## License

Distributed under the MIT License. See `LICENSE` for details.

```