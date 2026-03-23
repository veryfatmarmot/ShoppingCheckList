# Tickets

## M0 foundation
- M0-T1 Initialize monorepo structure
- M0-T2 Create Expo app with web target
- M0-T3 Configure Firebase SDK
- M0-T4 Create domain package with base types
- M0-T5 Implement normalization helpers
- M0-T6 Implement validation helpers
- M0-T7 Add repository interfaces
- M0-T8 Write initial specs into repo

## M1 auth and shell
- M1-T1 Implement Google sign-in
- M1-T2 Create authenticated app shell
- M1-T3 Add tab navigation
- M1-T4 Create bootstrap user document flow
- M1-T5 Implement app loading and auth guards

## M2 groups
- M2-T1 Define Group model and mapper
- M2-T2 Implement group repository
- M2-T3 Build Groups screen list
- M2-T4 Build create/edit group modal
- M2-T5 Implement reorder logic
- M2-T6 Implement missing-group-to-Ungrouped resolver

## M3 catalog
- M3-T1 Define CatalogItem repository
- M3-T2 Implement catalog subscriptions/load
- M3-T3 Build Catalog screen grouped view
- M3-T4 Build edit catalog item modal
- M3-T5 Implement create catalog item validation
- M3-T6 Implement duplicate detection by normalizedName
- M3-T7 Implement tombstone delete flow
- M3-T8 Disable adding already-active catalog items

## M4 list
- M4-T1 Define ListItem repository
- M4-T2 Build Shopping List screen grouped view
- M4-T3 Implement add-from-catalog flow
- M4-T4 Implement quantity modal
- M4-T5 Implement add one-time item flow
- M4-T6 Implement edit one-time list item modal
- M4-T7 Implement mark-bought delete flow
- M4-T8 Implement shopping complete empty state

## M5 offline and sync
- M5-T1 Enable Firestore offline persistence
- M5-T2 Add sync status hook
- M5-T3 Implement local undo buffer
- M5-T4 Implement compensating recreate on undo
- M5-T5 Add timestamp-based conflict helpers
- M5-T6 Add ID collision handling/logging path

## M6 stabilization
- M6-T1 Test duplicate edge cases
- M6-T2 Test deleted catalog resurrection behavior
- M6-T3 Test missing-group fallback
- M6-T4 Test offline create/edit/delete flows
- M6-T5 UX polish pass
- M6-T6 Prepare backlog for post-MVP sync propagation