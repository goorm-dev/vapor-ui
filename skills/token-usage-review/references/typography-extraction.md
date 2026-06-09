# typography 추출 (실행 순서 1 — typography 분기)

> 텍스트 노드에서 "어떻게 typography 토큰을 적용했는가"를 읽어 `TypoElement[]`를 만드는 단계.
> 색상 추출(`extraction-and-resolution.md`)과 같은 `use_figma` 단일 스크립트 실행이며, 색상 추출과 같은 트리 순회에서 TEXT 노드를 함께 뽑아도 된다.

## 1. 핵심 API — `getStyledTextSegments` 단일 호출

색상 추출이 fill/stroke 바인딩을 트리에서 읽듯, typography 추출은 **`node.getStyledTextSegments([...])`를 노드당 1회** 호출한다. Figma Plugin API 문서의 "performant way to get multiple text properties which may have mixed values".

```js
const segs = node.getStyledTextSegments([
    'textStyleId',
    'fontName',
    'fontSize',
    'lineHeight',
    'letterSpacing',
    'boundVariables',
    'textStyleOverrides',
]);
```

호출 결과는 동일한 스타일 조합을 갖는 세그먼트 배열이다. **세그먼트가 2개 이상이면 한 노드 안에 스타일이 섞인 것(mixed)이다.**

### 왜 `getRangeBoundVariable` 5회 호출로 대체하면 안 되나

- **IPC 비용**: 필드마다 1회 = 노드당 최소 5회 IPC. `getStyledTextSegments` 1회로 대체 가능.
- **override 탐지 불가**: override 노드는 `textStyleId`가 있고 `boundVariables.fontStyle`의 변수 ID도 스타일과 동일한데, **resolved `fontName`만 다르다**. 변수 ID만 비교하면 "정상"으로 통과시킨다 — resolved 값 비교가 필수.

### 왜 `textStyleId` 유무만 보면 안 되나

라이브 측정(Button 페이지 832노드) 결과:

| 분류                                           | 개수      |
| ---------------------------------------------- | --------- |
| Text Style 적용 + resolved 값 완전 일치 (정상) | 756 (91%) |
| Text Style 적용 + 개별 필드 override           | 8         |
| Text Style 없이 변수만 바인딩                  | 17        |
| raw (토큰 미사용)                              | 36        |

`textStyleId` 유무만 보면 override(8)·var-only(17)·raw(36) = 61개를 놓친다.

## 2. appliedStatus 판정 알고리즘

```js
async function classifyNode(node) {
    const segs = node.getStyledTextSegments([
        'textStyleId',
        'fontName',
        'fontSize',
        'lineHeight',
        'letterSpacing',
        'boundVariables',
        'textStyleOverrides',
    ]);

    // ① mixed: 세그먼트 2개 이상
    if (segs.length > 1) {
        return { appliedStatus: 'mixed', textStyle: null, overriddenFields: [] };
    }

    const seg = segs[0];
    const styleId = seg?.textStyleId;

    // ② Text Style 있음 → resolved 값 비교로 override 탐지
    if (styleId) {
        const style = await figma.getStyleByIdAsync(styleId);
        // style이 null이면 remote library 미enabled — styled-clean으로 보수적 처리
        if (!style) {
            return {
                appliedStatus: 'styled-clean',
                textStyle: null,
                overriddenFields: [],
            };
        }
        const overriddenFields = [];
        // fontName.family + fontName.style(weight) 비교
        if (
            seg.fontName?.family !== style.fontName?.family ||
            seg.fontName?.style !== style.fontName?.style
        )
            overriddenFields.push('fontName');
        if (seg.fontSize !== style.fontSize) overriddenFields.push('fontSize');
        // lineHeight: type+value 모두 비교
        if (
            seg.lineHeight?.unit !== style.lineHeight?.unit ||
            seg.lineHeight?.value !== style.lineHeight?.value
        )
            overriddenFields.push('lineHeight');
        if (
            seg.letterSpacing?.unit !== style.letterSpacing?.unit ||
            seg.letterSpacing?.value !== style.letterSpacing?.value
        )
            overriddenFields.push('letterSpacing');

        return {
            appliedStatus: overriddenFields.length > 0 ? 'styled-override' : 'styled-clean',
            textStyle: style.name, // e.g. "heading3"
            overriddenFields,
        };
    }

    // ③ Text Style 없음 → boundVariables 유무
    const bv = seg?.boundVariables ?? {};
    const hasBinding = Object.keys(bv).some((k) =>
        ['fontFamily', 'fontSize', 'fontStyle', 'lineHeight', 'letterSpacing'].includes(k),
    );
    return {
        appliedStatus: hasBinding ? 'var-only' : 'raw',
        textStyle: null,
        overriddenFields: [],
    };
}
```

### fontWeight 주의

`fontWeight`(숫자)는 readonly 파생값이고 독립 변수가 없다. 굵기는 `fontName.style`("Bold"/"Medium" 라벨)로만 표현된다. `boundVariables`의 `fontStyle` 변수 이름이 `typography-fontWeight-700`이어도 값은 `"bold"` 라벨이다. **override 비교에서 weight는 `fontName.style`로 확인한다.**

## 3. TypoElement 양식

```js
// typography-evaluate.mjs 입력 형식
// {
//   nodeId:          string                   // Figma 노드 id (리포트 딥링크)
//   name:            string                   // 레이어 이름
//   characters:      string                   // 텍스트 앞 20자 (어느 텍스트인지 식별용)
//   textStyle:       string | null            // 적용된 Text Style 이름 / 미적용 null
//   viewport:        'pc'|'tablet'|'mobile'   // 프레임 너비로 판별
//   appliedStatus:   'styled-clean'|'styled-override'|'var-only'|'raw'|'mixed'
//   overriddenFields: string[]                // styled-override일 때 어긋난 필드 목록
//   resolved: {
//     fontSize:      number
//     lineHeight:    { unit: string, value?: number }
//     letterSpacing: { unit: string, value: number }
//     fontName:      { family: string, style: string }
//   }
// }
```

`characters`는 `node.characters.slice(0, 20)`으로 자른다.

## 4. 뷰포트 판별

프레임의 직계 조상 중 가장 가까운 FRAME/COMPONENT 노드의 `width`로 판별한다.

| 너비       | viewport   |
| ---------- | ---------- |
| ≥ 1024     | `'pc'`     |
| 768 ~ 1023 | `'tablet'` |
| < 768      | `'mobile'` |

트리 순회 중 현재 루트 프레임의 너비를 한 번 읽어 모든 자식 노드에 동일하게 적용해도 된다(단일 프레임 검증 기준).

## 5. 스크린샷

```js
// get_screenshot 호출 시 해상도
maxDimension: 2576;
```

스크린샷은 3단 LLM이 위계 역할을 추론할 때 사용한다. 고해상도로 찍어야 작은 텍스트도 읽힌다.

## 6. 추출 후 셀프체크

`evaluate.mjs`에 넘기기 전에 다음을 확인한다:

- [ ] `raw` 노드가 있다면 의도한 것인지 — raw는 토큰이 전혀 없는 노드이므로 추출 누락이 아닌지 재확인.
- [ ] `textStyle` 이름이 스키마 `roleKeys`에 없는 것이 있으면 — 오타/미등록 Text Style 가능성. 3단 LLM에 알린다.
- [ ] `mixed` 노드가 있으면 — 한 텍스트 노드에 스타일이 섞인 것. 리포트에 명시하되 위반으로 세지 않는다(정상 취급).
- [ ] 전체 텍스트 노드 수와 TypoElement 배열 길이가 일치하는지 — 누락 없음 확인.
