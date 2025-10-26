# Project Overview

A secure backend service (MVP) for debit collection built with NestJS + TypeScript, using MongoDB for persistence. The service focuses on securely storing sensitive payment-related fields (field-level encryption), running collection jobs, and exposing REST APIs for CRUD and operational tasks.

# Key features

REST API for customers, payment methods, and collection runs

Field-level encryption for PII/payment fields

Scheduled/background worker for collection attempts

Docker Compose for quick local setup (optional)

Tech Stack

NestJS (TypeScript)

MongoDB (Mongoose)

Node.js

Docker & Docker Compose (optional)

Getting started (local)
Prerequisites

Node.js (>=16)

npm or yarn

MongoDB (local or connection string)

(Optional) Docker and Docker Compose

Install & Run
# install
npm install


# local (dev)
npm run start:dev


# build & run
npm run build
npm run start:prod
With Docker Compose (optional)

If you want a quick local setup with MongoDB + Redis, run the included docker-compose.yml:

# from repo root
docker-compose up --build

(See the docker-compose file provided below.)

# API (high level)

Note: adjust paths/naming to match your implementation.

POST /auth/login — Obtain JWT

POST /customers — Create a customer (sensitive fields encrypted)

GET /customers/:id — Get customer (sensitive fields masked)

POST /payment-methods — Add card/bank detail (stored encrypted)

POST /collections/run — Trigger a one-off collection run

GET /collections/:id — Get collection run status

# Include proper RBAC for sensitive endpoints in production.

# Field encryption

Use AES-256-GCM (or AES-256-CBC with HMAC) for authenticated encryption.

Store { iv, data, tag? } per encrypted field (or encrypt a JSON blob containing multiple sensitive fields if you prefer).

Keep ENCRYPTION_KEY in a secrets manager in production.

Tradeoffs:

Per-field encryption allows fine-grained access control but increases storage & indexing complexity.

Encrypting a blob is simpler and reduces index pain but prevents querying on encrypted fields.

Design decisions & trade-offs

NestJS: chosen for structure, DI, and testability. Good for team projects.

MongoDB (document DB): flexible model for payments and runs. Good for rapid iteration. If strict relational constraints are required, prefer Postgres.

Field-level encryption vs DB-level encryption:

Field-level: better for selective decryption, but complicates queries.

Full-disk/DB encryption: simpler but less fine-grained control.

Secrets management: rely on environment variables in dev; use a vault/secret manager in prod.