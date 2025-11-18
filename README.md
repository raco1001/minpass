# MinPass — A Unified Life Management Platform

“Organize your life with clarity, structure, and intelligence.”
MinPass is a full-stack modular platform designed to unify schedules, tasks, journals, activities, and personal ontology into a seamless, intelligent experience.

This repository provides a complete monorepo for a production-grade system built with:

NestJS MSA (multi-service architecture)

React + Vite front-end

gRPC + mTLS for secure internal communication

MariaDB + Neo4j for relational and graph data

DDD + Hexagonal Architecture

pnpm Workspace for scalable orchestrated development

## 1. Overview

MinPass aims to provide a structured platform where users can manage their time, tasks, habits, and personal knowledge graph in one place.

This repo contains:

A fully modular backend, split into feature-driven microservices

A modern front-end built with React, TypeScript, and Vite

A complete architecture with internal contracts, domain layers, adapters, and infrastructure modules

Comprehensive documentation (SRS, Architecture, ERD, Use Cases, etc.)

This README guides you through the project at a high level, while detailed documentation can be found under each sub-directory.

## 2. Repository Structure

```bash
.
├── backend/ # NestJS MSA (all backend services)
├── frontend/ # React + Vite frontend
├── docs/ # Vision, Requirements, SRS, ERD, Architecture, Use Cases
└── README.md # ← You are here
```

Each folder is isolated with clear responsibility boundaries and versioned through a shared pnpm workspace.

## 3. System Architecture

### High-Level Architecture (diagram available in /docs)

```bash
Frontend (React)
↓ HTTP/HTTPS
API Gateway / APIS service (NestJS)
↓ gRPC (mTLS-secured)
Auth / Users / Schedules / Tasks / Journals / Notifications / Activities / Ontology
↓
MariaDB / Neo4j Databases
```

### Architectural Style

**Domain-Driven** Design

**Hexagonal Architecture** (Ports & Adapters)

**Strong separation**: Presentation / Application / Domain / Infrastructure

**Modular, independently deployable** services

All services communicating via **gRPC** with optional **authentication**

## 4. Project Modules

### **Backend** — NestJS MSA / Flask MS / Infrastructures(MariaDB, Neo4j, Redis)

**Service Responsibility Path**

**4.1 apis**

Public HTTP API Gateway + gRPC Clients /backend/nestjs-msa/apps/apis

**4.2 auth**

OAuth, token issuing, provider guards /apps/auth

**4.3 users**

User domain + consents /apps/users

**4.4 tasks**

Task management domain /apps/tasks

**4.5 schedules**

Calendar & scheduling /apps/schedules

**4.6 journals**

Personal journaling and notes /apps/journals

**4.7 activities**

Activity tracking /apps/activities

**4.8 notifications**

Event-based notification system /apps/notifications

**4.9 ontology**

Knowledge graph / Foundry-style ontology /apps/ontology

**4.10 libs**

Shared modules: logging, config, DB integrations, proto contracts /libs

### **Frontend** — React

Built with React + Vite

Feature-oriented structure (auth, calendar, session, UI components, widgets)

MSW mock server included for testing

Zod-based validation layer

Routing & guards with custom session logic

Documentation: frontend/docs/0. Architecture

## 5. Development Environment

Requirements

Node.js 20+

pnpm 9+

Docker (for MariaDB, Neo4j, and local development)

OpenSSL (for regenerating mTLS certificates)

```bash
Install
pnpm install
pnpm -w run build
```

## 6. Running the Project

Backend (individual services)

```bash
cd backend/nestjs-msa
pnpm run start:dev apps/apis
pnpm run start:dev apps/auth
pnpm run start:dev apps/users
...
```

Auto Setup (recommended)
sh backend/nestjs-msa/scripts/setup-all.sh

This configures environment variables, certificates, dependencies, and DB initialization.

Frontend

```bash
cd frontend
pnpm run dev
```

## 7. Communication & Protocol

HTTP → public API (auth, web callbacks, etc.)

gRPC (mTLS-enabled) → internal microservice communication

Protocol definitions → backend/nestjs-msa/contracts/proto

## 8. Security

mTLS certificates with regeneration script (regenerate-certs.sh)

OAuth strategy isolation (Google, GitHub)

Token guards, custom request decorators

Pino-based logging with redaction & sanitization

## 9. Scripts

Script Purpose
setup-all.sh Complete environment setup
setup-envs.sh Configure env templates
regenerate-certs.sh Re-generate gRPC SSL certificates
new-dr.sh Create new Decision Log
gen-adl-index.mjs Auto-generate ADL index
📚 10. Documentation Index

### Located at /docs/intermediates

Document Checklist

Requirements

Product Vision

Project Scope

Software Requirements Specification

Use Cases

User Journey

System Architecture Diagram

ERD (Conceptual / Logical / Physical)

API Specification

## 🛠 11. Tech Stack

Backend

NestJS mono-repo

TypeScript

MariaDB, Neo4j

pnpm workspace

gRPC + mTLS

Jest (Unit/E2E)

Pino logging

Frontend

React 18 + Vite

TypeScript

Zustand store

Zod schema-level validation

MSW for local mocking

CSS Modules

## 12. Roadmap

Service boundary stabilization

Observability stack: Grafana + Loki

CI/CD powered by GitHub Actions (deployment: Naver Cloud / AWS)

Phase 2: Kubernetes migration

Advanced Ontology features (graph querying + analytics)

## 13. Contributing

Please follow:

Conventional Commits

Feature-branch workflow

Mandatory unit tests for domain logic

Decision Logs for architecture-level changes

## 14. License

MIT License © MinPass Team

## Closing Notes

MinPass is built with scalability, clarity, and long-term evolution in mind.
This repository serves as the foundation for a structured and extensible life-management platform that grows with user behavior, knowledge, and daily routines.
