# Project Rules & Guidelines

## Table of Contents
- [Project Structure](#project-structure)
- [Code Style](#code-style)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Data Fetching](#data-fetching)
- [TypeScript](#typescript)
- [Styling](#styling)
- [Testing](#testing)
- [Git Workflow](#git-workflow)
- [Documentation](#documentation)

## Project Structure

```
/
├── app/                    # App router pages and API routes
│   └── (chat)/            # Chat feature routes
│       ├── library/       # Library page
│       └── ...
├── components/            # Reusable UI components
│   ├── ui/                # Base UI components
│   ├── app-sidebar.tsx    # Main application sidebar
│   └── ...
├── lib/                   # Core business logic
│   ├── db/               # Database related code
│   │   ├── queries.ts    # Database queries
│   │   └── schema.ts     # Database schemas
│   └── ...
├── public/               # Static assets
├── tests/                # Test files
└── ...
```

## Code Style

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Use **semicolons** at the end of statements
- Maximum line length: **100 characters**
- Use **PascalCase** for:
  - Component names
  - Type/Interface names
- Use **camelCase** for:
  - Variables
  - Functions
  - Methods
  - Props
  - File names (except components)
- Use **kebab-case** for:
  - File names of components (e.g., `app-sidebar.tsx`)

## Component Architecture

1. **Component Organization**
   - One component per file
   - Keep components small and focused
   - Use named exports for components
   - Place component-specific types in the same file

2. **Props**
   - Define prop types using TypeScript interfaces
   - Destructure props at the top of the component
   - Use default props when appropriate
   - Keep required props at the top

3. **Example Component Structure**
   ```tsx
   import React from 'react';
   
   interface ComponentNameProps {
     requiredProp: string;
     optionalProp?: number;
   }
   
   export function ComponentName({
     requiredProp,
     optionalProp = 42,
   }: ComponentNameProps) {
     // Component logic here
     
     return (
       <div>
         {/* JSX */}
       </div>
     );
   }
   ```

## State Management

1. **Local State**
   - Use `useState` for simple component state
   - Use `useReducer` for complex state logic
   - Keep state as local as possible

2. **Global State**
   - Use React Context for application-wide state
   - Consider libraries like Zustand or Jotai for complex state
   - Keep state updates predictable and pure

## Data Fetching

1. **Server Components**
   - Use Server Components by default
   - Fetch data in server components when possible
   - Use `fetch` with Next.js caching

2. **Client-side Data Fetching**
   - Use `useSWR` or `@tanstack/react-query` for client-side data
   - Implement proper loading and error states
   - Cache responses when appropriate

## TypeScript

1. **Type Definitions**
   - Avoid using `any` type, if simple, if complex just use any
   - Use specific types for props and state
   - Create type aliases for complex types
   - Use `interface` for public API definitions
   - Use `type` for unions, tuples, or complex types

2. **Type Safety**
   - Enable strict mode in `tsconfig.json`
   - Use type guards for runtime type checking
   - Leverage TypeScript's utility types

## Styling

1. **Tailwind CSS**
   - Use Tailwind utility classes for styling
   - Keep custom styles minimal
   - Use `@apply` for repeated utility combinations

2. **CSS Modules**
   - Use for component-specific styles
   - Follow BEM naming convention
   - Keep selectors shallow

## Testing

1. **Unit Tests**
   - Write tests for utility functions
   - Test complex business logic
   - Use `@testing-library/react` for component tests

2. **E2E Tests**
   - Write end-to-end tests for critical user flows
   - Use Playwright for browser automation
   - Test across different viewports

## Git Workflow

1. **Branch Naming**
   - `feature/` for new features
   - `bugfix/` for bug fixes
   - `hotfix/` for critical production fixes
   - `chore/` for maintenance tasks

2. **Commit Messages**
   - Use conventional commits format:
     - `feat:` for new features
     - `fix:` for bug fixes
     - `docs:` for documentation changes
     - `style:` for formatting changes
     - `refactor:` for code refactoring
     - `test:` for test files
     - `chore:` for build/configuration updates

## Documentation

1. **Code Comments**
   - Document complex logic
   - Explain "why" not just "what"
   - Keep comments up-to-date

2. **Component Documentation**
   - Document props with JSDoc
   - Include usage examples
   - Document side effects

3. **Project Documentation**
   - Keep README.md up-to-date
   - Document setup instructions
   - Include contribution guidelines

## Performance

1. **Optimizations**
   - Use `React.memo` for expensive renders
   - Implement code splitting
   - Lazy load heavy components
   - Optimize images and assets

2. **Bundle Size**
   - Keep dependencies minimal
   - Use dynamic imports for large components
   - Analyze bundle size regularly

---

*Last updated: July 13, 2025*
