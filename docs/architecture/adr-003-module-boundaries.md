# ADR-003: Module Boundaries

## Status

Accepted

## Context

EvaluateMe v3 has multiple bounded contexts (authentication, testing, payments,
administration, etc.). Without clear module boundaries, code tends to form a
"big ball of mud" where any feature can import any other feature, leading to:

- Tight coupling that prevents parallel development
- Difficulty replacing or refactoring a single subsystem
- Unclear ownership of business logic

## Decision

We will organize the backend into 13 modules, each with a single responsibility:

`auth`, `users`, `companies`, `campaigns`, `technologies`, `tests`, `test-engine`,
`access-codes`, `candidates`, `payments`, `results`, `admin`, `notifications`.

Each module may contain:

- Controller (Presentation/API layer)
- Application use cases
- Domain entities/ports (shared in `packages/domain`)
- Infrastructure repositories

Cross-module communication MUST use domain ports or explicit integration contracts.
Circular dependencies between modules are forbidden and are checked in CI.

## Consequences

### Positive

- Clear ownership and responsibility per module
- Parallel feature development by different team members
- Easier testing and refactoring within a module boundary
- Enforced dependency direction through ports

### Negative

- More initial boilerplate for integration contracts
- Developers must think about module placement before coding

## Cycle Detection

`scripts/check-module-cycles.sh` parses imports between `apps/api/src/modules/*`
and exits with non-zero status if any circular dependency is found.

## References

- `docs/architecture/modules.md`
- `docs/architecture/layers.md`
