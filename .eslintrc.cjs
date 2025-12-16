module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.ts'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react-refresh', '@typescript-eslint', 'react'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      // Boundary restrictions for App.tsx
      files: ['App.tsx'],
      rules: {
        'no-restricted-imports': [
          'warn',
          {
            patterns: [
              {
                group: ['**/utils/storageUtils*'],
                message: 'App.tsx should not directly handle persistence. Consider extracting to a domain storage adapter (CareerContext/JobApplications). See docs/architecture/composition-root.md',
              },
              {
                group: ['**/services/geminiService*'],
                message: 'App.tsx should not directly orchestrate AI calls. Consider extracting to a domain controller or hook. See docs/architecture/composition-root.md',
              },
            ],
          },
        ],
      },
    },
    {
      // Prevent CareerContext from depending on JobApplications or Workspace
      files: ['**/hooks/useCareerContext.ts', '**/services/careerStorage.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/hooks/useJobApplications*', '**/hooks/useWorkspace*', '**/controllers/JobApplication*'],
                message: 'CareerContext must not depend on JobApplications or Workspace. See docs/architecture/domain-boundaries.md',
              },
            ],
          },
        ],
      },
    },
    {
      // Prevent JobApplications from depending on Workspace or GeneratedIntelligence UI
      files: ['**/hooks/useJobApplications.ts', '**/controllers/JobApplicationController.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/hooks/useWorkspace*', '**/components/*'],
                message: 'JobApplications must not depend on Workspace or UI components. See docs/architecture/domain-boundaries.md',
              },
            ],
          },
        ],
      },
    },
    {
      // GeneratedIntelligence must be pure and stateless
      files: ['**/services/ai/**/*.ts', '**/services/geminiService.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/hooks/**', '**/components/**', '**/utils/storageUtils*'],
                message: 'GeneratedIntelligence must not depend on UI, hooks, or storage. Must be pure and stateless. See docs/architecture/domain-boundaries.md',
              },
            ],
          },
        ],
      },
    },
    {
      // Workspace must not own persistent state
      files: ['**/hooks/useWorkspace.ts', '**/hooks/useWorkspaceHydration.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/utils/storageUtils*'],
                message: 'Workspace must not own persistent state. Storage is the responsibility of CareerContext/JobApplications. See docs/architecture/domain-boundaries.md',
              },
            ],
          },
        ],
      },
    },
  ],
};

