Let's outline a plan to implement the type organization improvements. We'll focus on incremental steps, leveraging existing tests and TypeScript's compiler as our primary validation tools.

**Overall Guiding Principles:**

- **Safety First**: Each step should be small enough that it's easy to revert if something goes wrong.
- **Compiler is Your Friend**: Rely heavily on the TypeScript compiler (`tsc`) to catch errors after moving types and updating imports.
- **Existing Tests are Key**: Ensure all existing unit and integration tests pass after each step.
- **Clear Commit Messages**: Use descriptive commit messages for each step to track changes.

Here's a proposed plan:

**Phase 1: Establish a Central Location for Genuinely Global or Widely Shared Foundational Types**

This phase focuses on types that are fundamental and used across many disparate parts of the application, not just within a single feature or component group.

- **Step 1.1: Identify Candidate Global Types**

  - **Action**: Manually review the codebase, particularly looking at common utility functions, core services, or base component props. Look for types like `Point`, `Vector`, `Dimensions`, or any other simple, foundational data structures that appear in multiple, unrelated modules.
  - **Consider**: Are these types truly global, or are they specific to a domain (e.g., "geometry," "rendering") that might have its own shared types file later? For now, err on the side of caution; if it's used in 3+ distinct, unrelated areas, it's a candidate.
  - **Output**: A list of type names and their current file locations.

- **Step 1.2: Create the Global Types File**

  - **Action**: Create a new file: `src/types/global.ts` (or `src/types/common.ts` if you prefer).
  - **Implementation**:

    ```typescript
    // filepath: src/types/global.ts
    // This file is intended for type definitions that are truly global
    // and foundational to the application, used across multiple,
    // unrelated modules.

    // Example:
    // export interface Point {
    //   x: number;
    //   y: number;
    // }

    // Add identified global types here
    ```

  - **Testing**: Not applicable yet.

- **Step 1.3: Migrate One Global Type (Iterative)**
  - **Action**: Pick _one_ type from your identified list.
    1.  Move its definition from its current location to `src/types/global.ts`.
    2.  Export it from `src/types/global.ts`.
    3.  Update all import statements across the project that previously imported this type to now import it from `src/types/global.ts`. Your IDE's "Find and Replace in Files" or "Move symbol" refactoring tools can be very helpful here.
  - **Testing**:
    1.  **TypeScript Compilation**: Run `npm run tsc` (or your project's equivalent command to run the TypeScript compiler, often `tsc --noEmit`). Fix any compilation errors. This is the most critical check.
    2.  **Linting**: Run your linter (e.g., ESLint) to catch any import order or style issues.
    3.  **Run All Tests**: Execute your full test suite (e.g., `npm test`). All tests must pass.
  - **Commit**: If all checks pass, commit this change with a clear message, e.g., "Refactor: Move `TypeName` to global types".
  - **Repeat**: Repeat Step 1.3 for each identified global type, one at a time.

**Phase 2: Consolidate Shared Domain-Specific or Feature-Level Types**

This phase addresses types that are shared within a specific domain (e.g., all 3D geometry calculations) or a larger feature area (e.g., all "Prism" related components, as per your existing refactoring plans).

- **Step 2.1: Identify Candidate Shared Domain/Feature Types**

  - **Action**: Look at your refactoring plans (e.g., for `TrapezoidalPrism.tsx`) and existing module structures. Identify types that are shared among components or modules within a specific domain (e.g., Prism) or a utility group (e.g., `src/utils/math/`).
  - **Example**: The types in `src/components/Prism/trapezoidalPrism.types.ts` might be used by other prism components.
  - **Output**: A list of type groups and their intended new shared type files (e.g., `src/components/Prism/types.ts`, `src/utils/math/types.ts`).

- **Step 2.2: Create Shared Type Files and Migrate (Iterative per Domain/Feature)**
  - **Action**: For _one_ identified domain or feature:
    1.  Create the new shared types file (e.g., `src/components/Prism/types.ts`).
    2.  Move relevant shared type definitions from their current locations (e.g., from individual component type files like `trapezoidalPrism.types.ts` if they are to be shared more broadly within the `Prism` module) into this new shared file.
    3.  Export them from the new shared file.
    4.  Update all import statements within that domain/feature to use the new shared types file.
    5.  Consider re-exporting types from this new shared file if it makes sense for external consumers of the module (as mentioned in refactoring-for-modularity.md).
  - **Testing**: Same as Step 1.3 (TypeScript compilation, linting, all tests pass).
  - **Commit**: Commit changes for this domain/feature, e.g., "Refactor: Consolidate shared types for Prism components into `src/components/Prism/types.ts`".
  - **Repeat**: Repeat Step 2.2 for each identified domain/feature group.

**Phase 3: Standardize Component-Local Types**

This phase ensures consistency for types that are strictly local to a single component.

- **Step 3.1: Review and Enforce Local Type File Convention**
  - **Action**: For components that have their own props, state, or internal helper types not shared elsewhere, ensure they follow a consistent pattern. The pattern `src/components/MyComponent/MyComponent.types.ts` (as implied by your `trapezoidalPrism.types.ts` example) is a good one.
  - **Implementation**:
    - If a component has inline types that are becoming numerous or complex, move them to an adjacent `ComponentName.types.ts` file.
    - Ensure these local type files are only imported by their corresponding component file.
  - **Testing**: Same as Step 1.3 (TypeScript compilation, linting, all tests pass). This will likely be a series of smaller, component-by-component refactorings.
  - **Commit**: Commit changes per component or small group of components.

**Phase 4: Documentation and Convention Establishment**

- **Step 4.1: Document the Type Organization Strategy**
  - **Action**: Update or create a document (e.g., in a docs folder or `CONTRIBUTING.md`) that outlines:
    - Where global types reside (`src/types/global.ts`).
    - Where shared domain/feature types reside (e.g., `src/features/<feature>/types.ts`, `src/components/<group>/types.ts`).
    - The convention for component-local types (`<componentDir>/<ComponentName>.types.ts`).
    - Guidelines on when to create a new shared types file versus adding to an existing one.
    - Guidelines on re-exporting types from module-level `types.ts` files.
  - **Testing**: Peer review of the documentation for clarity and completeness.

**Additional Considerations:**

- **IDE Tooling**: Leverage your IDE's refactoring tools ("Rename Symbol", "Move File", "Find Usages", "Go to Definition") extensively. They can automate many import updates.
- **TypeScript `paths` or `baseUrl`**: If not already configured, setting up `baseUrl` (e.g., to src) and `paths` in your tsconfig.json can simplify import statements (e.g., `import { MyType } from 'types/global';` instead of `import { MyType } from '../../types/global';`). This is a good complementary improvement but can be done independently.
- **No New Tests (Initially)**: This refactoring primarily involves moving code. Existing tests should cover the behavior. If you find areas with poor test coverage during this process, make a note to add tests _after_ the type refactoring for that area is stable, or _before_ if the area is particularly complex and risky.

This plan provides a structured approach. Start with Phase 1, as global types often have the widest impact. Proceed cautiously, testing thoroughly at each small step.
