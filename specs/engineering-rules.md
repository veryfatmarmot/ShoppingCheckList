# Engineering Rules

## Workflow
- implement one ticket at a time
- verify before next ticket
- do not expand scope
- do not implement the whole MVP in one prompt

## Core rules
- keep code explicit
- keep files and functions small
- prefer boring code
- no speculative abstractions
- no placeholder-heavy code

## Layer rules
- no Firebase calls from screens
- no business rules in JSX/UI components
- no React imports in domain package
- normalization and validation live in domain only

## TypeScript
- use strict typing
- avoid `any`
- explicit nullability
- typed Firestore mappers

## Write rules
- full-document overwrite only
- respect LWW by `updatedAt`
- do not invent merge logic
- keep client GUIDs

## Dependency rules
- prefer fewer dependencies
- add a dependency only if needed for MVP
- forbidden unless explicitly approved: GraphQL, Tailwind/NativeWind, styled-components, custom sync engine

## Refactoring
- refactor only for real duplication or clarity
- avoid unrelated drive-by changes
- keep changes scoped to current ticket

## Tests
Prioritize domain tests:
- normalize
- validate
- duplicate helper
- group fallback
- sorting

## Spec discipline
- follow specs exactly
- if implementation changes behavior, update the owning spec
