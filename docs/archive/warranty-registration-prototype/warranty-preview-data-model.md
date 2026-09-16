# Ward Rain&Sun Warranty System V1 Preview — Data Model

This document describes a proposed data shape only. The V1 Preview pages do not connect to a backend, database, object storage, email automation, or Amazon API.

## Feature flag

`ENABLE_WARRANTY_RECORD_REGISTRATION = true` for the internal Preview.

Production value must be decided after Amazon compliance review. If disabled, the Warranty Record entry point should become “Lifetime Warranty & Product Care,” while Product Support and Warranty Claim remain available.

**AMAZON COMPLIANCE REVIEW REQUIRED before production launch.**

## Warranty Record

| Field | Suggested type | Preview behavior |
| --- | --- | --- |
| `warranty_record_id` | string | Mock `WR-XXXXXXXX` generated in browser |
| `amazon_order_id` | string | Temporary page/session state only |
| `product_model` | string | Temporary page/session state only |
| `purchase_date` | date | Temporary page/session state only |
| `product_photo` | object reference | Local image preview only; not uploaded |
| `product_photo_label` | enum | `early_product_condition` or `current_product_condition` |
| `early_warranty_record` | boolean | Derived from purchase date (`<= 30 days`) |
| `support_instructions_reviewed` | boolean | Set after required acknowledgement |
| `operating_instructions_reviewed` | boolean | Set after required acknowledgement |
| `instruction_version` | string | `Auto Umbrella Guide v1.0` |
| `acknowledged_at` | timestamp | Browser timestamp in Mock state |
| `record_created_at` | timestamp | Browser timestamp in Mock state |
| `record_updated_at` | timestamp | Browser timestamp after a Mock update |
| `purchase_verification_status` | enum | Defaults to internal-only `not_reviewed` |

`purchase_verification_status` is not shown to the customer during Warranty Record creation. Record creation does not mean an Amazon order was verified.

## Warranty Claim

| Field | Suggested type | Preview behavior |
| --- | --- | --- |
| `case_id` | string | Mock `WS-XXXXXXXX` generated in browser |
| `warranty_record_id` | string | Existing Mock ID or new Mock `WR-XXXXXXXX` |
| `issue_type` | enum | Selected issue category |
| `amazon_order_id` | string | Temporary page state only |
| `product_model` | string | Temporary page state only |
| `purchase_date` | date / nullable | Temporary page state only |
| `full_product_photo` | object reference | Local image preview only; not uploaded |
| `issue_photo` | object reference | Local image preview only; not uploaded |
| `problem_description` | text | Temporary page state only |
| `contact_email` | string | Temporary page state only; support-case use only |
| `purchase_verification_status` | enum | `not_reviewed`, `reviewing`, `verified`, or `needs_more_information` |
| `case_created_at` | timestamp | Browser timestamp in Mock state |

## Preview data handling

- No production database is read or written.
- No API request is made.
- No email automation is triggered.
- No image is uploaded.
- No contact email is stored.
- Warranty-to-Claim prefill uses temporary browser `sessionStorage` when available. It is limited to the current browser session and is not transmitted.
- Image data is resized in the browser for local preview. If temporary session capacity is unavailable, the Claim page asks the customer to select the image again.

## Production gates

- **PRODUCTION BACKEND NOT CONNECTED.**
- **PRODUCT TEAM MUST VERIFY FINAL OPERATING INSTRUCTIONS BEFORE PRODUCTION LAUNCH.**
- **LEGAL REVIEW REQUIRED — Define “Lifetime” explicitly before production launch.**
- **AMAZON COMPLIANCE REVIEW REQUIRED.**
- Confirm secure storage, access control, retention, deletion, audit history, rate limiting, upload validation, malware scanning, privacy disclosures, and email-purpose restrictions before any production implementation.
