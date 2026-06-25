import type { LightboxBox } from '~/utils/messaging';

const Z = 2147483647;

// 활성 탭 페이지 위에 전체화면 이미지 오버레이를 그린다(순수 DOM, React 없음).
// sidepanel은 패널 폭을 못 벗어나므로 확대는 여기서 한다.
// 박스 좌표는 캡처 당시 뷰포트 px이므로, 표시폭/naturalWidth 비율로 스케일한다.
export const showLightbox = (dataUrl: string, boxes: LightboxBox[], alt: string) => {
    document.getElementById('vapor-qa-lightbox')?.remove();

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
        const scale = img.clientWidth / img.naturalWidth;
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
};
