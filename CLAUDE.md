Purpose

This product helps users externalize, organize, and develop their thoughts. It prioritizes:
- Frictionless thought capture (Sparks)
- Structured development into Notebooks

Sparks are first-class citizens. Capture and merge workflows are the core differentiator.

Stack
- Frontend: TypeScript, React
- Editor: Tiptap v2  (rich text, store as Tiptap JSON)
- Database: Supabase
- AI: OpenAI

## Commit Conventions

Use descriptive commit messages with a type prefix:

- `Feat:` New features
- `Fix:` Bug fixes
- `Chore:` Maintenance, dependency updates
- `Docs:` Documentation changes
- `Refactor:` Code refactoring without behavior changes

Example: `Feat: add support for Azure Speech provider`

## Code Style & Philosophy

### Typing & Pattern Matching

- Prefer **explicit types** over raw dicts—make invalid states unrepresentable where practical
- Prefer **typed variants over string literals** when the set of valid values is known.
- Use **exhaustive pattern matching** (`match` in Python and Rust, `ts-pattern` in TypeScript) so the type checker can verify all cases are handled
- Structure types to enable exhaustive matching when handling variants
- Prefer **shared internal functions over factory patterns** when extracting common logic from hooks or functions—keep each export explicitly defined for better IDE navigation and readability

#### Type Design Signals

Use this as a quick feel for when types are not well utilized.

- Finite value set -> union/enum instead of `string`
- Mutually exclusive states -> state union/enum instead of many booleans
- Function inputs that represent domain concepts -> use those domain types directly

```text
Under-modeled:
  start_session(provider_id: string, is_recording: boolean, is_paused: boolean)

Better modeled:
  ProviderId = "deepgram" | "assemblyai" | "whisper"
  SessionState = "idle" | "recording" | "paused" | "error"
  start_session(provider_id: ProviderId, session_state: SessionState)
```

### Self-Documenting Code

- **Verbose naming**: Variable and function naming should read like documentation
- **Strategic comments**: Only for non-obvious logic or architectural decisions; avoid restating what code shows

### Test Writing Standards
- Prioritize **business behavior** and user-visible outcomes over implementation details.
- Test our own domain logic (state transitions, message parsing, defaults, fallbacks), not third-party library internals.
- Prefer real typed inputs/outputs and avoid mocking behavior by default.
- Use mocks only when truly necessary, primarily at unstable boundaries (network, filesystem, time, OS integrations) for determinism.
- Keep tests resilient to refactors: assert on externally meaningful behavior, not private call sequences.

If the compiler cannot guarantee correctness, the design is incomplete.

2. Domain-First Architecture
All features must flow through explicit domain types:
- type Spark
- type Notebook
- type RoutingEvent

UI must not mutate database shapes directly.
All mutations pass through typed domain services.

No ad-hoc state transformations.

3. Explicit Data Contracts
- Every API boundary must use validated schemas (e.g. Zod).
- Database rows must map to domain models via explicit transformers.
- Never trust external input (AI, user input, storage).


4. AI Integration Rules
- AI outputs must be schema-validated.
- Never inject raw AI output into editor state.
- AI suggestions are proposals, not mutations.
- Deterministic state updates after AI calls.

5. Context7 Documentation Requirement
- When referencing external libraries (React, Tiptap, React Flow, SQLite, OpenAI):
- Always retrieve documentation using Context7.
- Never rely on memory for API usage.

6. Capture-First UX Bias

All design decisions should optimize:
- Speed of Spark capture
- Minimal friction before writing
- Seamless routing into structured Notebooks
- Increasing content quality over time

7. State Management Constraints
- Single source of truth per domain entity.
- No duplicated Spark state across components.
- Use normalized data structures.
- Prefer derived selectors over duplicated computed state.

8. Verification
Before finishing any task:
- tsc --noEmit — must pass with zero errors
- Run relevant tests if they exist
- Run the linter/formatter if configured