# Development Guide

## Workflow

### Prerequisites
- **Node.js**: v18 or higher
- **Package Manager**: npm (preferred) or yarn
- **Git**: For version control

### Quick Start
1.  **Clone & Install**:
    ```bash
    git clone [repo-url]
    npm install
    ```
2.  **Environment**: Create `.env.local` with `VITE_GEMINI_API_KEY`.
3.  **Run**: `npm run dev` opens the app at `http://localhost:3000`.

## Code Style & Standards

We enforce high standards to keep the codebase maintainable:

- **TypeScript Strict Mode**: No `any`, strict null checks, no unused locals.
- **Components**: PascalCase (e.g., `JobCard.tsx`).
- **Hooks**: camelCase, start with use (e.g., `useJobManagement.ts`).
- **Design System**: Use defined Tailwind tokens in `index.css` (e.g., `bg-surface-base`, `text-accent`) instead of arbitrary hex codes.

## Common Tasks

### Adding a New Feature
1.  **Create Component**: Add `src/components/features/MyNewFeature.tsx`.
2.  **Add State**: If needed, update `workspaceStore.ts` or create a local store.
3.  **Route**: If it's a page, add to `src/routes/index.tsx` (lazy loaded).
4.  **Error Handling**: Wrap in `<FeatureErrorBoundary featureName="MyFeature">`.

### Adding a New Store
1.  Create `src/stores/myStore.ts`.
2.  Use `create<MyState>()(...)`.
3.  If persisting data, wrap with `persist`.
4.  Export hooks/selectors.

## Troubleshooting

### Build Errors
- **Memory Limit**: If `npm run build` fails, try increasing Node memory: `NODE_OPTIONS="--max-old-space-size=4096" npm run build`.
- **Type Errors**: Run `npx tsc --noEmit` to see specific TypeScript failures. The build will fail if types are incorrect.

### Runtime Issues
- **Missing API Key**: Ensure `.env.local` is set and loaded.
- **Blank Screen**: Check console for ErrorBoundary logs. Verify all lazy-loaded chunks are reachable (network tab).
