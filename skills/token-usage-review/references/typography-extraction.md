# typography 추출 (실행 순서 1 — typography 분기)

> 텍스트 노드에서 "어떻게 typography 토큰을 적용했는가"를 읽어 `TypoElement[]`를 만드는 단계.
> 색상 추출과 같은 동결 스크립트(`scripts/extract.figma.js`)의 같은 트리 순회에서 함께 뽑힌다 — 실행 방법은 `extraction-and-resolution.md` §1과 동일.

## 1. 판정 설계 근거 (스크립트의 `classifyTextNode`가 구현)

- **`getStyledTextSegments` 노드당 1회**가 추출의 전부다. 세그먼트가 2개 이상이면 한 노드에 스타일이 섞인 것(`mixed`).
- **`textStyleId` 유무만 보면 안 된다.** 라이브 측정(Button 페이지 832노드): 정상 756 / style+override 8 / 변수만 바인딩 17 / raw 36 — styleId만 보면 61개를 놓친다.
- **override 탐지는 변수 ID 비교가 아니라 resolved 값 비교.** override 노드는 변수 ID가 스타일과 동일한데 resolved `fontName`만 다르다.
- **fontWeight 주의**: `fontWeight`(숫자)는 readonly 파생값. 굵기는 `fontName.style`("Bold" 라벨)로만 비교한다.
- **remote Text Style**: `getStyleByIdAsync`가 `null`이면 override 탐지가 불가능해 `styled-clean`으로 보수적 처리(리포트에 명시).

## 2. appliedStatus 5종

| status            | 의미                                  | 판정      |
| ----------------- | ------------------------------------- | --------- |
| `styled-clean`    | Text Style 적용 + resolved 완전 일치  | 정상      |
| `styled-override` | Text Style 적용 + 일부 필드 직접 수정 | 정상 취급 |
| `var-only`        | Style 없이 개별 변수만 바인딩         | 정상 취급 |
| `mixed`           | 한 노드에 세그먼트 2개+               | 정상 취급 |
| `raw`             | Style도 변수도 없음                   | **high**  |

## 3. TypoElement 양식

스크립트가 그룹핑해 반환한다(동일 `name`·`characters`·`textStyle`·`viewport`·`appliedStatus`·`resolved` 조합은 `nodeIds`/`count`로 압축):

```js
// { nodeIds: string[], count: number,
//   name, characters(앞 20자), textStyle: string|null,
//   viewport: 'pc'|'tablet'|'mobile',   // 루트 프레임 너비: ≥1024 pc / 768~1023 tablet / <768 mobile
//   appliedStatus, overriddenFields: string[],
//   resolved: { fontSize, lineHeight, letterSpacing, fontName } }
```

## 4. 추출 후 셀프체크

- [ ] `raw` 노드가 있으면 — 시안이 정말 토큰 미사용인지, 추출 누락인지 재확인(`stats.textNodes`와 `typoElements` 합 일치 확인).
- [ ] `textStyle`이 스키마 `roleKeys`에 없으면 — `typography-evaluate.mjs` 출력의 `unknownTextStyles`에 잡힌다. 3단에서 LOW confidence 처리.
- [ ] `mixed` 노드는 리포트에 명시하되 위반으로 세지 않는다.
