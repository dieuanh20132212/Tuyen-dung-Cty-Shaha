# Firestore Security Specification

This document presents the detailed architectural blueprint for the zero-trust security configuration protecting user files, application state, and recruiting entities.

## 1. Data Invariants

* **Jobs**: A Job document requires key tracking metrics: Working Mode, Title, and creator authentication. Changes to Job details can only be made by active Recruiters.
* **Candidates**: Personally Identifiable Information (PII) including physical addresses, telephone logs, and uploaded resumes must only be readable and alterable by certified recruiting members.
* **Applications**: Application reports require valid, normalized matching scores (0 to 100) and are mapped exclusively to recognized Jobs.
* **Interviews**: Scheduled events require platform anchors and are linked to active Recruiters.

## 2. Invalidation Test Scenarios ("Dirty Dozen" Payloads)

Here are the twelve high-risk threat vectors blocked by our Zero-Trust Firestore Security Ruleset:

1. **Anonymous Modification**: Unauthenticated user trying to create standard Job profiles.
2. **Identity Spoofing**: Attempt to insert a candidate profile belonging to another UID.
3. **Privilege Escalation**: Recruiter client attempting to elevate user role directly in `users/` collection.
4. **Incorrect Match Bounds**: Inserting an application scoring schema with -20 or 150 points.
5. **ID Poisoning Attack**: Submitting complex ASCII-art keys or massive blocks as document IDs.
6. **Denial of Wallet payload**: Triggering huge string inputs in document metadata.
7. **Bypassing Access Role**: Standard user reading private emails of other candidates.
8. **Inter-state Shortcut**: Modifying internal candidate feedback statuses directly without proper recruitment authorization.
9. **Tampering with Immortals**: Altering immutable `createdBy` field or modifying static creation logs.
10. **Client-side Clock Injection**: Uploading client-generated dates in `updatedAt` tracking fields.
11. **Orphaned Writes**: Creating an active Application referencing a fully corrupted or missing Job.
12. **Self-Assigned RBAC**: Forbidding standard logins from registering as "Super Admin".

---
*Status: Hardened. Deployment confirmed.*
