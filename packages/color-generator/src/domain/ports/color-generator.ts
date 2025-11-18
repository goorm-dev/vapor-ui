import type { BackgroundColor, ContrastRatios, KeyColor, PrimitiveColorTokens } from '../models';

/**
 * Leonardo Adapter 입력 매개변수
 */
export interface LeonardoAdapterInput {
    /** 키 컬러 배열 (기준 배경색 제외) */
    colors: KeyColor[];
    /** 기준 배경색 정보 */
    backgroundColor: BackgroundColor;
    /** 명암비 설정 */
    contrastRatios: ContrastRatios;
    /** lightness 값 (light 또는 dark 모드용) */
    lightness: number;
}

/**
 * Color Generator Port - Infrastructure 계층이 구현해야 하는 인터페이스
 *
 * 이 인터페이스는 외부 라이브러리(Leonardo, Culori)와의 통신을 추상화합니다.
 */
export interface ColorGeneratorPort {
    /**
     * Leonardo Adapter를 통해 Primitive Color Palette를 생성합니다.
     *
     * @param input - Leonardo adapter 입력 파라미터
     * @returns N+1개의 팔레트와 background canvas를 포함한 결과
     */
    generatePalette(input: LeonardoAdapterInput): PrimitiveColorTokens;
}
