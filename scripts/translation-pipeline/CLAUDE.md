# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Type check
pnpm --filter @vapor-ui/translation-pipeline typecheck

# Lint
pnpm --filter @vapor-ui/translation-pipeline lint

# Run all tests
pnpm --filter @vapor-ui/translation-pipeline test:run

# Run a single test file
pnpm --filter @vapor-ui/translation-pipeline test:run -- src/translator/translator.test.ts

# Run tests with coverage
pnpm --filter @vapor-ui/translation-pipeline test:coverage

# Build
pnpm --filter @vapor-ui/translation-pipeline build
```

Path alias `~` maps to `src/`. (`~/types` → `src/types.ts`)

## Architecture

### Core Flow

```
cli/run.ts
  → translator/translator.ts          # cache lookup, initial translation, outcome merge
      → translation/translate.ts      # LLM initial translation (batch of 20)
      → translator/batch-lifecycle.ts # MQM → postprocess → final MQM
          → validation/validator.ts   # MQM prompt and error shape
  → report/report.ts                  # renders .i18n-report.md
```

### Module Boundaries

- **`cli/run.ts`**: Owns all file I/O. Normalizes input to `TranslatableDoc[]`, writes `ko/*.json`. No LLM logic.
- **`translator/translator.ts`**: Decides cache hit/miss, chunks by component, merges outcomes back into JSON. Does not call LLM directly.
- **`translator/batch-lifecycle.ts`**: Runs the batch MQM → batch postprocess → final MQM loop. Only called from `translator.ts`.
- **`translation/client.ts`**: Single wrapper for LiteLLM `/chat/completions`. Every LLM call goes through this file.
- **`types.ts`**: `MqmCategory` union is the single source of truth. Adding or removing a category here causes a compile error in `validator.ts` via the `satisfies` check on `MQM_CATEGORIES`.

### Design Constraints — Read Before Modifying

**MQM mirroring rule**: The Style rules in `translate.ts` and the `Fluency/Unnatural phrasing` criteria in `validator.ts` intentionally contain the same content. Changing one requires changing the other. If they diverge, the initial MQM will fail more often, increasing postprocess cost.

**Cache key composition**: `makeCacheKey` in `cache.ts` hashes `version + source + targetLocale + translationModel + validationModel + postprocessModel`. Changing any model name in `defaults.ts` invalidates the entire cache and triggers a full re-translation on the next run.

**Degraded outcome**: If any batch step (MQM, postprocess, or final MQM) returns a malformed response, the affected units are marked `unverified`. The three reason codes are `batch_mqm_failed`, `batch_postprocess_failed`, and `batch_final_mqm_failed`.

**Cache write timing**: Only `verified` outcomes are written to cache. Cache is saved after each component finishes (inside the loop in `translator.ts`), so a mid-run crash does not lose already-completed components.

### Test Structure

All LLM calls are replaced with `vi.mock('~/translation/client')`. No test hits a real API. `tests/cli.test.ts` creates a tmp directory and validates the full file I/O pipeline end-to-end.

Coverage excludes `src/cli/**` and `src/**/types.ts`. Thresholds: 70% lines/functions/statements, 65% branches.
