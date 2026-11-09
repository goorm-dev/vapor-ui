---
name: implement-figma
description: Figma 시안 하나를 채점 없이 vapor-ui 코드로만 옮긴다. "채점 없이 구현만", "점수는 필요 없고 코드만", "implement only, no grading"처럼 사용자가 검증을 빼 달라고 분명히 말할 때, 또는 figma-to-code가 구현 단계에서 부를 때만 쓴다. Figma URL과 함께 구현을 요청하는 평소 말투는 figma-to-code 스킬이 맡는다.
---

# Figma 시안을 vapor-ui 코드로

Figma MCP 서버가 연결돼 있어야 한다. 없으면 설치를 안내하고 멈춘다.

## 순서

1. URL에서 `fileKey`와 `nodeId`를 뽑는다. `node-id=1-234`는 `1:234`로 바꾼다.
2. Figma MCP `get_design_context`로 노드 트리와 Code Connect 스니펫을, `get_screenshot`으로 이미지를 받는다.
3. 라이브러리 인스턴스(💙로 시작하는 노드)는 vapor-ui 컴포넌트로 옮긴다. Code Connect 스니펫이 있으면 그 태그와 props를 그대로 쓰고, 그 인스턴스 안의 구성도 스니펫을 따른다. 없으면 `references/design-system-recognition.md`로 이름과 variant를 대응한다.
4. props와 파트 구성이 확실하지 않으면 components 스킬로 설치된 버전의 props와 예제를 확인한다.
5. 오토 레이아웃 프레임은 `references/figma-layout-mapping.md`대로 `VStack`·`HStack`·`Box`·`Grid`로 옮기고, 간격·반경·색은 `references/token-mapping.md`의 토큰으로 `$css`에 쓴다.
6. 사용자가 정한 위치에 파일을 쓴다. 정하지 않았으면 레포 구조를 보고 고른 뒤 알린다.

## 지킬 것

- 시안의 라이브러리 인스턴스는 하나도 빼지 않는다. 화면에서 안 보이게 하려고 지우지 않는다.
- 단, 부모 인스턴스의 스니펫에 없는 하위 인스턴스는 부모 컴포넌트가 스스로 그리는 것이다. composites `Dialog`의 닫기 버튼이 그렇다. 따로 쓰면 두 번 그려진다.
- Code Connect 스니펫의 variant props(`size`, `colorPalette` 등)는 바꾸지 않는다.
- `position: absolute`, 색 리터럴(hex·rgb·hsl), 토큰 눈금에 있는 px 값을 쓰지 않는다. 토큰으로 쓴다.
- 텍스트 문구는 시안을 따른다.

## 끝나면

쓰거나 고친 파일 경로와, 화면이 가져다 쓴 기존 컴포넌트 파일 경로를 따로 적어 둔다. check-components는 둘 다, check-styling은 쓰거나 고친 파일만 받는다. 변환 예시는 `references/conversion-examples.md`에 있다.
