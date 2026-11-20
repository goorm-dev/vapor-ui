# Vapor UI Glossary

Vapor UI 디자인 시스템의 도메인 용어집. 이름이 같은 개념을 코드·문서·Figma에서 같은 말로 부르기 위해 둔다.

## Color Foundation

**스케일 (Scale)**:
팔레트 한 색 안의 단계 이름. 범용 색은 `050`~`900`, 중립 색만 `000`·`025`를 추가로 가진다.
_Avoid_: shade, step, 톤

**기준 배경 (Reference Background)**:
목표 명암비를 재는 상대 배경색. 모드마다 하나이며 light `#FFFFFF`, dark `#232323`로 고정이다.
_Avoid_: canvas (화면 배경 토큰과 구분), backgroundColor

**목표 명암비 (Target Contrast)**:
한 스케일이 기준 배경에 대해 가져야 하는 WCAG 2.x 명암비. 모드마다 별도 표를 가진다.
_Avoid_: contrast ratio(일반 명암비와 구분), lightness

**키 컬러 (Key Color)**:
한 색의 색조 곡선을 정하는 기준점 HEX. 흰색 → 키 컬러들 → 검정을 OKLCH로 이어 스케일별 색조를 뽑는다. 색 하나는 키 컬러 하나 이상을 가진다.
_Avoid_: seed, source color

**기준 색 (Base Colors)**:
050~200 공통 최대 채도를 정하는 11색 집합(red, orange, yellow, pink, grape, violet, blue, cobalt, cyan, green, lime). 새 색을 추가해도 이 집합과 그 채도 상한은 바뀌지 않는다.
_Avoid_: default colors, 기본 색

**옐로우 계열 (Yellow Family)**:
200 스케일 색조가 60°~150° 안에 드는 색. 050~200 채도 상한을 계열끼리 따로 정한다.

**중립 색 (Neutral)**:
기준 배경의 색조를 따라가는 무채색 계열 팔레트. 기준 배경이 순백이면 gray가 된다.
_Avoid_: canvas palette, background palette

**브랜드 컬러 (Brand Color)**:
조직이 지정한 HEX로, 팔레트 한 칸에 값 그대로 들어가는 색. 들어갈 칸은 기준 배경 대비 명암비가 (log 거리로) 가까운 순서대로 보아, 그 칸의 접근성 기준을 통과하고 이웃 칸과의 명암비 순서를 깨지 않는 첫 스케일이다. 이 색이 키 컬러가 되어 같은 팔레트의 나머지 칸을 만든다. light 모드에만 고정되고, dark 팔레트는 이를 반영한 light 곡선에서 파생된다.
_Avoid_: primary color, key color

**베이직 컬러 (Basic Color)**:
기준 색 외에 사용자가 팔레트 종류를 늘리려고 추가한 색. 입력 HEX(또는 키 컬러 3개)는 색조 곡선을 만드는 데만 쓰이고, 명도·채도는 규칙으로 계산된다. 그래서 입력 HEX가 팔레트에 그대로 나오지 않을 수 있다. 브랜드 컬러와 달리 어느 칸에도 고정되지 않는다.
_Avoid_: custom color, new color, 브랜드 컬러

**primary 기준 칸 (Primary Anchor)**:
primary 시맨틱 토큰(fill·border·텍스트)이 기대는 primary 팔레트의 스케일. light는 브랜드 컬러 칸(브랜드가 없으면 500)이고, 브랜드가 어느 칸에 들어가도 그 칸이 primary 바탕이 된다. dark는 브랜드와 기준 배경 대비 명암비가 가장 가까운 dark 칸(접근성 기준을 통과하는 첫 칸, 브랜드가 없으면 400)이다. 바탕이 배경 대비 3:1에 못 미치면 팔레트 검사가 경고한다.

**primary 위 전경색 (On-Primary Foreground)**:
primary 바탕 위 글자·아이콘 색. 흰 글자가 바탕 대비 4.5:1 이상이면 흰색, 아니면 검정이다. 모드가 아니라 바탕(브랜드) 색으로 정해진다. 브랜드가 밝은 칸(예: 200)에 들어가면 검정, 어두운 칸(예: 800)에 들어가면 흰색이다.
_Avoid_: staticWhite (고정 흰색), fg-inverse (모드에 따라 light 흰색 / dark 검정인 별개 토큰)
_Avoid_: deltaE 칸, lowest chip

**시각 보정 (Visual Correction)**:
규칙으로 계산한 팔레트를 디자이너가 눈으로 보고 칸별 색조만 돌리는 일. 명도는 목표 명암비, 채도는 채도 규칙을 돌린 색조에서 다시 따르므로 규칙은 깨지지 않는다. HEX를 직접 바꾸지 않는다. 생성기는 보정 전 팔레트까지만 내고, 보정은 Figma 플러그인에서 한다.
_Avoid_: override, tweak

**팔레트 검사 (Palette Check)**:
팔레트가 규칙을 지키는지 보는 네 가지 판정: 인접 색조 간격, 목표 명암비 ±1%, 접근성 기준, 채도 규칙. 색조 간격만 경고이고 나머지는 실패다.
