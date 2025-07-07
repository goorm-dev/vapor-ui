// ⚠️ Import 순서가 매우 중요합니다!
// 순환 참조를 피하기 위해 아래 순서를 반드시 지켜주세요.

// 1. CSS 레이어 정의 (가장 먼저)
import './layers.css';

// 2. CSS 변수 계약 생성 (vars)
import './vars.css';

// 3. 테마 값 할당 (vars가 생성된 후에만 가능)
import './theme.css';

// // 4. 글로벌 리셋 스타일
// import './global.css';

// // 5. 유틸리티 스타일
// import './utils/layer-style.css';
// import './sprinkles';
// import './sprinkles.css';

// ❌ 아래 imports는 제거됨 (순환 참조 문제):
// import './tokens';     // theme.css에서 이미 처리됨
// import './constants';  // theme.css에서 이미 처리됨