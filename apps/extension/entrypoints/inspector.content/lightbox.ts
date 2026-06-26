import type { LightboxBox } from '~/utils/messaging';

const Z = 2147483647;

// 직전 lightbox의 정리 함수. 노드만 지우면 resize/keydown 리스너가 남으므로
// 재오픈 시 이전 close()를 먼저 호출해 전부 떼어낸다.
let teardownPrevious: (() => void) | null = null;

// 활성 탭 페이지 위에 전체화면 이미지 오버레이를 그린다(순수 DOM, React 없음).
// sidepanel은 패널 폭을 못 벗어나므로 확대는 여기서 한다.
// 박스 좌표(rect)는 getBoundingClientRect의 CSS px인데, captureVisibleTab 이미지의
// naturalWidth는 물리 px(= CSS폭 × DPR)이다. 그래서 표시폭/naturalWidth로만 나누면
// 좌표·크기가 1/DPR로 줄어 박스가 좌상단으로 당겨진다. devicePixelRatio를 곱해 보정.
// (캡처·라이트박스가 같은 탭/페이지라 lightbox 시점 DPR = 캡처 시점 DPR로 본다.
//  ponytail: DPR을 저장해 넘기는 4파일 파이프라인 대신 한 줄. 캡처 후 다른 DPR
//  모니터로 창을 옮겨 여는 드문 경우만 어긋난다 — 그때 캡처 시점 DPR 저장으로 승격.)
export const showLightbox = (dataUrl: string, boxes: LightboxBox[], alt: string) => {
    teardownPrevious?.();

    const overlay = document.createElement('div');
    overlay.id = 'vapor-qa-lightbox';
    overlay.dataset.vaporQaUi = '';
    overlay.style.cssText = [
        'position:fixed',
        'inset:0',
        `z-index:${Z}`,
        'background:rgba(0,0,0,.8)',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'cursor:zoom-out',
    ].join(';');

    // 이미지 + 박스를 함께 담는 래퍼. 래퍼 크기 = 표시된 이미지 크기.
    const frame = document.createElement('div');
    frame.style.cssText = 'position:relative;line-height:0;';

    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = alt;
    img.style.cssText = 'display:block;max-width:90vw;max-height:90vh;width:auto;height:auto;';

    const drawBoxes = () => {
        if (img.naturalWidth === 0) return;
        frame.querySelectorAll('[data-box]').forEach((el) => {
            el.remove();
        });
        const scale = (img.clientWidth * window.devicePixelRatio) / img.naturalWidth;
        for (const { rect, index } of boxes) {
            const box = document.createElement('div');
            box.dataset.box = '';
            box.style.cssText = [
                'position:absolute',
                `top:${rect.top * scale}px`,
                `left:${rect.left * scale}px`,
                `width:${rect.width * scale}px`,
                `height:${rect.height * scale}px`,
                'border:2px solid #2a72e5',
                'border-radius:2px',
                'box-sizing:border-box',
                'pointer-events:none',
            ].join(';');
            if (index != null) {
                const label = document.createElement('span');
                label.textContent = String(index);
                label.style.cssText = [
                    'position:absolute',
                    'top:-2px',
                    'left:-2px',
                    'background:#2a72e5',
                    'color:#fff',
                    'font:11px/16px sans-serif',
                    'min-width:16px',
                    'text-align:center',
                    'border-radius:2px',
                    'padding:0 3px',
                ].join(';');
                box.append(label);
            }
            frame.append(box);
        }
    };

    img.addEventListener('load', drawBoxes);

    const close = () => {
        overlay.remove();
        window.removeEventListener('resize', drawBoxes);
        document.removeEventListener('keydown', onKey);
        teardownPrevious = null;
    };
    const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') close();
    };

    overlay.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', drawBoxes);

    frame.append(img);
    overlay.append(frame);
    document.body.append(overlay);
    teardownPrevious = close;
};
