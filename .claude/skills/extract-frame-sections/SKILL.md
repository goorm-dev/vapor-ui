---
name: extract-frame-sections
description: Figma composite 컴포넌트 가이드 페이지 하나에서 최상위 프레임 4개(Overview / Best practices / Examples / Related components)를 자동 탐색해 섹션별 JSON 4개로 뽑고, 각 sample.code를 Code Connect 우선 · Figma MCP fallback으로 채운다. 실행 시 페이지 URL을 인자로 넘긴다.
disable-model-invocation: true
---

# Extract Frame Sections

사용자가 넘긴 **Figma 페이지 URL** 하나로 4개 섹션 프레임을 자동 발견해 `apps/website/public/frame-sections/<slug>/<section>.json` 4개 파일을 생성한다. 정적 텍스트는 스크립트가 REST API로 결정론적으로 뽑고, 각 sample의 실제 코드 산출은 이 스킬이 Figma MCP로 채운다. **스킬 하위 config 파일 없음** — 대상 프레임은 페이지 안 최상위에서 이름으로 자동 매칭한다.

- 스크립트: `.claude/skills/extract-frame-sections/scripts/{extract.mjs, blocks.mjs, rest.mjs}`
- 출력: `apps/website/public/frame-sections/<slug>/{overview,best-practices,examples,related}.json`

관련: [[frame-sections-pipeline]] · [[composite-guide-pipeline]] (별개 파이프라인).

## 대상 프레임 자동 발견 규칙

페이지(CANVAS) direct 자식 FRAME 중 아래 이름과 **정확히 일치**(대소문자·공백 포함)하는 4개:

- `Overview`
- `Best practices`
- `Examples`
- `Related components`

같은 이름 프레임이 여러 개면 첫 번째만 채택. 4개 중 하나라도 없으면 어떤 이름이 빠졌는지 출력하고 중단.

## Step 0 — Figma MCP 인증 확인 (필수)

`mcp__plugin_figma_figma__whoami` 호출.

- 성공: 계속.
- 401 / 403 / 세션 없음: **즉시 중단**하고 사용자에게 다음을 안내:

    > Figma MCP 인증이 필요합니다. Figma 데스크탑 앱에서 로그인한 뒤 Claude Code에서 Figma MCP 서버를 다시 연결해 주세요. 인증이 끝나면 다시 실행하세요.

    REST-only fallback으로 우회하지 않는다 — sample.code 산출이 불가능해 결과가 반쪽짜리가 된다.

## Step 1 — 페이지 URL 확보

사용자에게 아래 형식의 **페이지 URL**을 요청한다:

```
https://www.figma.com/design/<fileKey>/<name>?node-id=<pageCanvasId>
```

**Figma에서 페이지 링크 얻는 법**: 왼쪽 사이드바에서 페이지 이름 우클릭 → `Copy link`. 이 링크의 `node-id`는 CANVAS(페이지 자체)를 가리켜야 한다.

프레임 URL이 넘어오면 스크립트가 `URL points at a frame inside page "<Page>" (<canvasId>), not the page itself` 로 안내하며 중단한다. 그 안내에 나오는 페이지 이름/id로 다시 페이지 링크를 만들어 재실행하도록 사용자에게 요청한다.

## Step 2 — 스크립트 실행 (정적 데이터 추출)

`FIGMA_TOKEN`(Figma personal access token — MCP 세션과 별개) 필요.

```
FIGMA_TOKEN=figd_... \
node .claude/skills/extract-frame-sections/scripts/extract.mjs \
  "<pageUrl>" \
  [slug] \
  [--alias name=value]...
```

- `<pageUrl>` — 필수. Figma 페이지 URL.
- `[slug]` — 선택. 출력 폴더 이름. 생략 시 페이지 이름을 kebab-case로 자동 유도(예: 페이지 `Dialog` → slug `dialog`).
- `--alias name=value` — 선택, 반복 가능. Figma 프레임 이름을 group 라벨로 리매핑. 예: 페이지 안에 `Properties`와 별개로 `Size` 프레임이 있을 때 `--alias Size=Properties`로 통합.

출력 스키마:

```
Section {
  slug, section, frameNodeId, sectionTitle,
  blocks: Block[]
}

Block {
  id: string,          // Figma node id
  group: string|null,  // 상위 프레임 이름 (alias 적용 후)
  variant: string|null,// Content block variant (예: "basic", "split", "columns")
  title, subtitle, description: string|null,
  raw: { sectionTitle, sectionSubtitle, sectionSubtitleReading, body },
  samples: Sample[]    // columns variant는 2개(Do/Don't), 그 외 1개
}

Sample {
  label: 'Do' | "Don't" | null,   // Do/Don't 페어일 때만
  nodeId: string|null,             // Figma 노드 id — get_code_connect_map/get_design_context 호출 대상
  type: string|null,               // 노드 name (예: "Dialog", "AlertDialog", "(Popup)") — 코드 산출 힌트
  description: string|null,        // Do/Don't 페어 각 케이스 본문
  code: null                       // Step 3에서 스킬이 채움
}
```

## Step 3 — Sample 코드 채우기 (Code Connect → MCP fallback)

4파일을 순회하며 각 `blocks[*].samples[*]`에 대해 (단, `nodeId !== null`인 것만):

1. `mcp__plugin_figma_figma__get_code_connect_map({ fileKey, nodeId })` 호출.
2. 매핑이 존재하면:

    ```json
    "code": {
      "source": "code-connect",
      "component": "<codeConnectName>",
      "importPath": "<codeConnectSrc>",
      "snippet": "<선택: 짧은 사용 예 (확신할 때만)>"
    }
    ```

3. 매핑이 없으면 `mcp__plugin_figma_figma__get_design_context({ fileKey, nodeId, clientFrameworks: 'react', clientLanguages: 'typescript,tsx' })` 호출.
    - **선행 규칙**: `get_design_context` 호출 전 `/figma-design-to-code` 스킬을 먼저 로드한다. 반환된 스니펫을 원본 그대로 저장 (vapor-ui 규약 재작성은 별도 스킬 range):

    ```json
    "code": {
      "source": "figma-mcp",
      "component": null,
      "importPath": null,
      "snippet": "<get_design_context가 돌려준 스니펫>"
    }
    ```

**절대 손대지 말 것**: `sectionTitle`, `blocks[*].id`, `title`, `subtitle`, `description`, `raw`, `group`, `variant`, `samples[*].{label, nodeId, type, description}`. 이 필드들은 다음 스크립트 실행이 덮어쓴다. `samples[*].code`만 in-place로 채운다.

## Step 4 — 검증

1. 4개 JSON `sectionTitle` 값이 `"Overview"` / `"Best practices"` / `"Examples"` / `"Related components"`.
2. `bestPractices.json`의 columns variant block은 `samples.length === 2`이고 각 `label`이 `"Do"`, `"Don't"`.
3. 모든 `samples[*].code`가 세팅되었거나 명시적으로 `null`.

## Notes — Overview의 Size 그룹 통일

Figma 파일 구조상 `Size`가 `Properties`와 형제 FRAME이면 walker가 별도 group으로 잡는다. `--alias Size=Properties`로 병합할 수 있다. Overview에 이런 형제 프레임이 여럿 나오는 페이지에서는 alias를 여러 개 넘긴다:

```
--alias Size=Properties --alias Layout=Properties
```

alias는 CLI 호출 시마다 결정 — 스킬 폴더 안 config 파일이 없으므로 페이지마다 자유롭게 조정한다.

## Notes — 기타

- **placeholder 필터**: TEXT `characters === name`이거나 컴포넌트 default 문자열(`Title`, `Description`, `body`, `section title`, `section subtitle`)이면 무시. columns variant에서 block-level 텍스트가 자주 null인 원인.
- **Anatomy 프레임**: `Component Guide/Content block` 인스턴스가 아니라 별도 레이아웃이라 blocks에 포함되지 않음. 필요 시 별도 필드 확장.
- **결정론 원칙**: 정적 텍스트는 스크립트가 REST로. LLM(이 스킬)은 sample 코드 산출에만 개입. [[deterministic_in_plugin]]과 일치.
- **경로 격리**: `apps/website/public/frame-sections/<slug>/`는 기존 [[composite-guide-pipeline]]의 `public/composites/<slug>/blocks.json`과 별개.
