# KapwaNet – AI‑Assisted Build & Contributor Instructions

## Purpose

This document enables AI agents (Claude, Codex, ChatGPT) and human contributors to reliably build KapwaNet from specifications.

---

## 1. Repository Structure

* apps/web        → Next.js frontend
* apps/api        → Django + Wagtail backend
* infra/          → Docker, nginx, scripts
* docs/           → PRD, policies, guides

---

## 2. Development Principles

* Build module-by-module
* Enforce org_id isolation everywhere
* Prefer simple, explicit code over abstraction
* Human-in-the-loop for moderation and publishing

---

## 3. AI Agent Usage Guidelines

### Recommended Roles

* Claude → backend models, Wagtail config, docs
* Codex/GPT → React components, API endpoints
* Human → architecture, security review, merges

### Prompting Rules

* Always specify module scope
* Never ask AI to build the whole system at once
* Require tests or validation steps where possible

---

## 4. Build Order (AI-Friendly)

1. Repo scaffold + Docker Compose
2. Org + membership models
3. Auth + roles
4. Styling engine (theme tokens)
5. Template library + block renderer
6. CMS pages
7. Bayanihan Help module
8. Item Sharing module
9. Messaging
10. Moderation

---

## 5. Definition of Done (Per Module)

* Models created
* API endpoints implemented
* Permissions enforced
* Basic tests pass
* Manual test steps documented

---

## 6. Safety & Compliance Guardrails

* No exact addresses stored by default
* No pricing in bayanihan posts
* Prohibited services enforced
* Logs for moderation actions

---

## 7. Open Source Expectations

* Clear commit messages
* Small PRs
* No secrets in repo
* Respect community code of conduct

---

## 8. Future AI Layer (Out of Scope for MVP)

* Content drafting assistant
* Layout suggestions
* Accessibility helpers

These must plug into existing CMS and template system.
