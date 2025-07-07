// ⚠️ Import 순서가 매우 중요합니다!
// 순환 참조를 피하기 위해 아래 순서를 반드시 지켜주세요.

// CSS 레이어 정의 (가장 먼저)
import './layers.css';

// 글로벌 리셋 스타일
import './global.css';
import './global-var.css';

// CSS 변수 계약 생성 (vars)
import './vars.css';

// 테마 값 할당 (vars가 생성된 후에만 가능)
import './theme.css';

// 유틸리티 스타일
import './sprinkles.css';
