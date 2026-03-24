# Spec Index

## Ownership
- `prd.md` — product scope, MVP boundaries, success criteria
- `domain-model.md` — entities, invariants, validation, normalization
- `firestore-schema.md` — Firestore paths, document shapes, query/load strategy
- `sync-rules.md` — offline behavior, LWW, overwrite/delete/resurrection rules
- `ux-flows.md` — screens, modals, actions, states
- `tickets.md` — execution order and ticket boundaries
- `tech-stack.md` — mandatory stack, package layout, allowed/forbidden tools
- `engineering-rules.md` — coding discipline and AI workflow rules

## Default prompt set
Always attach:
- `tech-stack.md`
- `engineering-rules.md`

Then add only the task-relevant files.

## Prompt sets by task

### UI / screens / modals
- `tech-stack.md`
- `engineering-rules.md`
- `ux-flows.md`
- optional: `domain-model.md`

### Data / repositories / Firebase
- `tech-stack.md`
- `engineering-rules.md`
- `domain-model.md`
- `firestore-schema.md`
- optional: `sync-rules.md`

### Domain helpers / validation / normalization
- `tech-stack.md`
- `engineering-rules.md`
- `domain-model.md`

### Planning / next ticket
- `tickets.md`
- optional: `prd.md`

### Product / UX review
- `prd.md`
- `ux-flows.md`
- optional: `domain-model.md`

## Rule
Do not attach all specs to every prompt.
