# KapwaNet – System Architecture & Deployment Blueprint

## 1. Architecture Overview

KapwaNet uses a modular monolith architecture optimized for simplicity, robustness, and open-source contribution.

## 2. Technology Stack

### Frontend

* Next.js (React)
* Server-side rendering for public pages
* Client-side rendering for member portal

### Backend

* Django REST Framework
* Wagtail CMS (content editing)
* JWT-based auth

### Database

* PostgreSQL

### Optional (Later)

* Redis (background jobs)
* Object storage (S3-compatible)

## 3. Core Services

* Web (Next.js)
* API (Django + Wagtail)
* Database (Postgres)

## 4. Multi-Tenancy Model

* organizations table
* memberships table
* org_id on all content records
* Feature flags per org

## 5. Styling System

* org_theme JSON
* CSS variables injected at runtime
* Theme presets seeded at install

## 6. Template System

* Block-based page definitions
* Templates as JSON presets
* Wagtail StreamField for editing
* Next.js block renderer

## 7. Deployment (VPS / DigitalOcean Droplet)

### Recommended Setup

* Ubuntu 22.04 LTS
* Docker + Docker Compose
* Nginx reverse proxy
* Let’s Encrypt TLS

### Containers

* web: Next.js
* api: Django/Wagtail
* db: Postgres

### Networking

* Public: ports 80/443
* Internal: container network only

## 8. Backups

* Nightly Postgres dumps
* Media volume backups
* Off-server storage recommended

## 9. Scaling Path

* Vertical scaling (bigger droplet)
* Add Redis for async tasks
* Split DB to managed service if needed

## 10. Security Basics

* UFW firewall
* HTTPS only
* Secrets via env vars
* Admin routes rate-limited
