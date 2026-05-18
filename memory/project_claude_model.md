---
name: Claude model choice for OCR
description: Why the app uses Claude Haiku for bill OCR and why cheaper alternatives weren't adopted
type: project
---

Using `claude-haiku-4-5-20251001` for bill image OCR/extraction (switched from deprecated `claude-3-haiku-20240307` on 2026-05-18).

**Why:** This is a personal app processing a handful of bills per month — cost per extraction is fractions of a cent regardless of model tier. GPT-4o-mini and Gemini Flash are cheaper per token but not worth adding a second API dependency.

**How to apply:** Don't suggest swapping AI providers for cost reasons unless usage grows significantly. If the model needs updating again, stay within the Anthropic Haiku tier first.
