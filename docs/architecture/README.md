# Architecture Documentation

This folder contains the architectural guidelines for the Rtios AI application.

## Quick Start

If you're new to the codebase or working with AI assistants:

1. **Read first**: [Composition Root Contract](./composition-root.md) - Understand what App.tsx may and may not do
2. **Then read**: [Domain Boundaries](./domain-boundaries.md) - Learn the four core domains and where code should live
3. **Check**: [`.cursorrules`](../../.cursorrules) for AI coding rules
4. **Run**: `npm run lint` to see boundary violations in your editor

## Overview

The Rtios AI architecture enforces clear boundaries between four core domains:

1. **CareerContext** - Resumes and user profile (global)
2. **JobApplications** - Job list and job-owned outputs (per-job)
3. **GeneratedIntelligence** - AI generation capabilities (pure, stateless)
4. **Workspace** - Transient UI state (execution-only)

**App.tsx** is the composition root that wires these domains together.

## Key Principles

### 1. App.tsx is a Composition Root
- Wires domains together
- Coordinates high-level navigation
- **Does NOT accumulate domain logic**

### 2. Domains Have Clear Boundaries
- Each domain owns specific state and logic
- Dependencies flow in one direction only
- No circular dependencies

### 3. State Shape Changes Require Full Updates
- No local adapters in App.tsx
- All consumers updated together
- Prevents compatibility layers

### 4. Temporary Violations Are Documented
- Current violations are acknowledged
- New violations are forbidden
- ESLint suppressions require TODO comments

## Files in This Folder

| File | Purpose |
|------|---------|
| [composition-root.md](./composition-root.md) | Defines what App.tsx may and may not do, with examples |
| [domain-boundaries.md](./domain-boundaries.md) | Maps domains, ownership, invariants, and dependencies |
| README.md (this file) | Quick reference and overview |

## Enforcement Mechanisms

The architecture is enforced through:

1. **Documentation** - These files
2. **Cursor/AI Rules** - `.cursorrules` file
3. **ESLint** - Boundary rules (warning-level for in-editor feedback)
4. **Code Review** - Social conventions

## Common Questions

### Where do I add new business logic?

**Not in App.tsx.** Follow this guide:

- Resume/profile logic → `hooks/useCareerContext.ts` or `services/careerStorage.ts`
- Job CRUD/selection → `hooks/useJobApplications.ts` or `controllers/JobApplicationController.ts`
- AI generation → `services/ai/` (no hooks, must be stateless)
- UI state → `hooks/useWorkspace.ts`
- Pure utilities → `utils/`

### Can I import X into Y?

Check the dependency rules in [domain-boundaries.md](./domain-boundaries.md#allowed-dependency-direction).

Quick reference:
- App.tsx can import anything
- CareerContext cannot import JobApplications or Workspace
- GeneratedIntelligence cannot import hooks, UI, or storage
- Workspace cannot import storage utilities

### What if I need to violate a rule temporarily?

See [Temporary Boundary Violations](./composition-root.md#temporary-boundary-violations) policy.

**Short answer**: Only for existing violations. New logic must go in the correct domain. If you must suppress ESLint, include a TODO with the target domain.

### How do I know if something is "domain logic" vs "composition"?

Ask these questions:

1. Does it coordinate multiple domains, or implement domain behavior?
   - **Coordinate** → likely OK in App.tsx
   - **Implement** → extract to domain

2. Could it be tested independently of the App component?
   - **Yes** → extract to hook/service/controller
   - **No** → might be composition logic

3. Does it contain conditional business rules or calculations?
   - **Yes** → extract to domain
   - **No** → might be composition logic

**When in doubt**: Leave a TODO and ask for clarification.

## Getting Started with Changes

Before making changes:

1. Identify which domain owns the logic
2. Check [domain-boundaries.md](./domain-boundaries.md) for the "Where code goes" section
3. Create hooks/services/controllers in the appropriate domain
4. Wire them together in App.tsx (coordination only)
5. Run `npm run lint` to check for boundary violations

## Planned Evolution

These boundaries are locked now. Future work (non-binding):

- Extract snapshot/hydration logic from App.tsx → JobApplications controller
- Extract AI orchestration from App.tsx → GeneratedIntelligence service layer
- Extract persistence from App.tsx → domain storage adapters
- Split monolithic `types.ts` into domain-specific type files

**No timeline required.** Extract opportunistically when touching related code.

## Need Help?

- Check the docs in this folder first
- Look at `.cursorrules` for AI coding rules
- Review existing code for patterns
- Leave TODO comments when unsure
- Ask the team for clarification

## Feedback

If these boundaries don't work in practice, document the friction and propose adjustments. The goal is to prevent logic creep without creating bureaucracy.

