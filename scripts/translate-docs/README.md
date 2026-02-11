# translate-docs

AI-powered incremental translation for component documentation.

Translates English component documentation JSON files to Korean using DeepL API.

## Features

- **Incremental translation**: Only translates changed or new files
- **Batch processing**: Single API call per component (not per prop)
- **Common props caching**: Shared props (`render`, `className`, etc.) are pre-translated constants, saving API calls
- **Technical term preservation**: Keeps technical terms in English
- **Prettier formatting**: Output files are formatted with Prettier

## Usage

```bash
# Translate changed files only (default)
pnpm translate

# Translate all files
pnpm translate:all

# Explicit changed files only
pnpm translate:changed
```

## Requirements

Set the `DEEPL_API_KEY` environment variable:

```bash
export DEEPL_API_KEY=your_api_key_here
```

> Free API 키는 `:fx`로 끝나며 자동으로 `api-free.deepl.com` 엔드포인트를 사용합니다.

## Glossary Setup (Optional)

기술 용어(component, props, callback 등)를 영어로 유지하려면 glossary를 생성하세요:

```bash
# 1. Glossary 생성 (한 번만 실행)
DEEPL_API_KEY=xxx pnpm create-glossary

# 출력 예시:
# ✓ Glossary created successfully!
#   ID: abc123-def456-...

# 2. 환경변수에 추가
export DEEPL_GLOSSARY_ID=abc123-def456-...

# 3. 번역 실행
pnpm translate
```

Glossary가 설정되면 `KEEP_ENGLISH_TERMS` 목록의 단어들이 번역되지 않고 영어로 유지됩니다.

## How It Works

### File Detection

The script detects files to translate in three ways:

1. **Changed tracked files**: `git diff` against `origin/main`
2. **New untracked files**: `git status` for new files in `en/`
3. **Missing translations**: Files in `en/` but not in `ko/`

### Translation Flow

```
en/button.json (English)
       ↓
   Check common props (render, className, etc.)
       ↓
   DeepL API (batch translate remaining descriptions)
       ↓
ko/button.json (Korean)
```

### Input/Output

**Input** (`en/button.json`):

```json
{
    "name": "Button",
    "description": "A clickable button component",
    "props": [
        {
            "name": "size",
            "description": "The size of the button"
        }
    ]
}
```

**Output** (`ko/button.json`):

```json
{
    "name": "Button",
    "description": "클릭 가능한 button component",
    "props": [
        {
            "name": "size",
            "description": "button의 size"
        }
    ]
}
```

### Common Props (Cached)

Shared props that appear in many components are pre-translated and stored in `src/constants/index.ts`:

- `render` - Component composition
- `className` - CSS class
- `style` - Inline styles
- `asChild` - Slot pattern

These props skip DeepL API calls entirely, saving tokens.

### Technical Terms

Technical terms are kept in English to maintain consistency:

- UI components: `button`, `modal`, `popover`, `tooltip`, etc.
- React terms: `props`, `state`, `callback`, `render`, etc.
- State terms: `disabled`, `loading`, `error`, etc.

See `src/constants/index.ts` for the full list.

## CI Integration

The GitHub Actions workflow (`.github/workflows/translate-docs.yml`) runs automatically:

| Trigger                     | Action                    |
| --------------------------- | ------------------------- |
| PR with `en/*.json` changes | Preview comment           |
| Push to `main`              | Auto-translate and commit |
| Manual dispatch             | Translate all or changed  |

### Required Secrets

Add `DEEPL_API_KEY` to your repository secrets.

## Project Structure

```
scripts/translate-docs/
├── src/
│   ├── index.ts              # 진입점
│   ├── create-glossary.ts    # Glossary 생성 진입점
│   ├── commands/             # CLI 명령어
│   │   ├── translate.ts
│   │   └── create-glossary.ts
│   ├── lib/                  # 핵심 로직
│   │   ├── translator.ts
│   │   └── git.ts
│   ├── constants/
│   │   └── index.ts          # 설정 및 기술 용어
│   └── types/
│       └── index.ts          # TypeScript 인터페이스
├── package.json
├── tsconfig.json
└── README.md
```
