# App.tsx: Composition Root Contract

## Purpose

`App.tsx` is the **application composition root**. Its sole responsibility is to wire together domains, coordinate high-level navigation, and pass dependencies to views.

**It must NOT accumulate new domain logic.**

## Allowed Responsibilities

`App.tsx` **MAY**:

- **Navigation & View Selection**: Switch between views (`landing`, `app`, `dashboard`, `pricing`, etc.)
- **Dependency Wiring**: Pass callbacks, services, and state to child components
- **Coordinate High-Level Actions**: Trigger snapshot/hydration when switching contexts
- **Read-Only State Derivation**: Compute derived values like `currentJob` and `currentResume` from domain state
- **Event Routing**: Forward events to appropriate domain handlers

### Examples from Current Code

✅ **Allowed (but may be refactored later)**:
```typescript
// Explicit snapshot trigger when navigating away
const handleNavigate = (view: View) => {
  if (activeJobId && currentView === 'app') {
    snapshotCurrentStateToJob(activeJobId);
  }
  setCurrentView(view);
};
```

✅ **Allowed**:
```typescript
// Derived state (read-only)
const currentJob = jobs.find(j => j.id === activeJobId) || { title: '', company: '', description: '', companyUrl: '' };
const currentResume = resumes.find(r => r.id === activeResumeId) || resumes[0];
```

## Forbidden Responsibilities

`App.tsx` **MUST NOT**:

- **Own Persistence Logic Details**: Direct calls to `localStorage`, serialization rules, storage keys
- **Contain Conditional Business Rules**: "If premium plan, allow X features", "If resume missing keywords, show warning"
- **Construct AI Prompts**: Building prompt text, selecting model parameters
- **Own Feature-Specific State Machines**: Multi-step wizards, form validation flows
- **Implement Domain Calculations**: Score calculations, keyword matching, data transformations
- **Act as a Compatibility Layer**: Adapting state shapes between domains (see State Shape Change Rule)

### Examples from Current Code (Will Be Extracted)

⚠️ **Currently Violating (tolerated temporarily)**:

```typescript
// PERSISTENCE ORCHESTRATION (lines 83-104)
// Should be: CareerContext / JobApplications storage adapters
useEffect(() => {
  const loadedData = loadFromStorage();
  if (loadedData) {
    setResumes(loadedData.resumes);
    setJobs(loadedData.jobs);
    // ... restoration logic
  }
}, []);

useEffect(() => {
  saveToStorage(resumes, jobs, userProfile);
}, [resumes, jobs, userProfile]);
```

```typescript
// AI ORCHESTRATION (lines 290-349)
// Should be: GeneratedIntelligence service layer or controller
const handleGenerate = async () => {
  // Direct calls to GeminiService with prompt assembly
  const researchPromise = GeminiService.researchCompany(...);
  const analysisPromise = GeminiService.analyzeResume(...);
  // ... coordination of AI pipeline
};
```

```typescript
// SNAPSHOT/HYDRATION LOGIC (lines 108-123, 204-241)
// Should be: JobApplications controller/hook
const snapshotCurrentStateToJob = useCallback((jobIdToUpdate: string | null) => {
  if (!jobIdToUpdate) return;
  setJobs(prevJobs => prevJobs.map(j => 
    j.id === jobIdToUpdate ? {
      ...j,
      outputs: { research: appState.research, analysis: appState.analysis, ... }
    } : j
  ));
}, [appState]);
```

```typescript
// "SINGLE RESUME" ENFORCEMENT (lines 165-167)
// Should be: CareerContext domain rule
setResumes([newResume]); // Enforces single resume by replacing array
```

## Temporary Boundary Violations

`App.tsx` currently contains logic that violates the ideal composition-only contract (e.g., persistence orchestration, AI service calls, snapshot/hydration implementation).

### Policy

- **These are tolerated temporarily** to avoid premature refactoring.
- **New logic of these types must NOT be added.**
- **Existing violations should be extracted opportunistically** when touching related code.
- **Any suppression (ESLint disable) must include a TODO with the target domain.**

Example of acceptable temporary suppression:

```typescript
// eslint-disable-next-line no-restricted-imports -- TODO: Extract to JobApplications controller
import { saveToStorage } from './utils/storageUtils';
```

## Planned Extractions (Non-binding)

These are the likely first candidates for extraction. This is **informational only** and does not mandate immediate refactoring:

1. **Snapshot/hydration logic** → `JobApplications` controller/hook
   - `snapshotCurrentStateToJob`
   - Job switching hydration logic in `handleSelectStrategy`
   
2. **AI orchestration** → `GeneratedIntelligence` service layer
   - `handleGenerate` (research + analysis + cover letter pipeline)
   - `handleRegenerateCoverLetter`
   - `handleGenerateLinkedIn`
   - `handleGenerateInterviewQuestions`
   
3. **Persistence orchestration** → `CareerContext` / `JobApplications` storage adapters
   - `loadFromStorage` / `saveToStorage` effects
   - Resume/job CRUD with automatic persistence
   
4. **Domain invariants** → Domain-level validation/constraints
   - "Single resume only" enforcement
   - "Outputs belong to jobs" validation

## State Shape Change Rule

**If a domain's state shape changes:**

- ✅ All consumers must be updated in the same change
- ❌ `App.tsx` must NOT adapt shapes locally (no inline transformations)
- ❌ Temporary adapters in `App.tsx` are forbidden

**Why**: This forces proper domain ownership and prevents `App.tsx` from becoming a compatibility layer.

**Bad Example**:
```typescript
// DON'T DO THIS - App.tsx adapting JobInfo shape changes
const currentJob = jobs.find(j => j.id === activeJobId);
const adaptedJob = { 
  title: currentJob?.jobTitle || '', // Adapting old field name
  company: currentJob?.companyName || '' 
};
```

**Good Example**:
```typescript
// DO THIS - Update JobInfo type and all consumers together
// types.ts: JobInfo.title renamed to JobInfo.jobTitle
// App.tsx, InputForm.tsx, etc.: All updated in same commit
```

## Enforcement

This contract is enforced through:

1. **Documentation** (this file)
2. **Cursor/AI Rules** (`.cursorrules`)
3. **ESLint boundary rules** (warning-level, in-editor feedback)
4. **Code Review Conventions**

## Questions?

If you're unsure whether logic belongs in `App.tsx`:

1. Ask: "Does this coordinate multiple domains, or implement domain behavior?"
   - Coordinate → likely OK in App.tsx
   - Implement → extract to domain
   
2. Ask: "Could this logic be tested independently of the App component?"
   - Yes → extract to hook/service/controller
   - No → might be composition logic
   
3. **When in doubt, leave a TODO comment** and ask for clarification.

