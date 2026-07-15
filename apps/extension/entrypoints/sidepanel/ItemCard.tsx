import { useEffect, useRef, useState } from 'react';

import { Card, Collapsible, HStack, Text, VStack } from '@vapor-ui/core';

import { getImage } from '~/utils/data/image-store';
import type { QaItem } from '~/utils/data/session-store';
import { sendMessage } from '~/utils/messaging';

const useImageUrl = (imageRef?: string) => {
    const [url, setUrl] = useState<string>();

    useEffect(() => {
        // imageRef가 바뀌거나 비면 이전 미리보기를 먼저 비운다 — 안 그러면 새 blob을
        // 받기 전까지 다른 그룹의 옛 스크린샷이 잠깐 그대로 남는다.
        setUrl(undefined);
        if (!imageRef) return;

        let objectUrl: string | undefined;
        let active = true;

        void getImage(imageRef).then((blob) => {
            if (!blob || !active) return;
            objectUrl = URL.createObjectURL(blob);
            setUrl(objectUrl);
        });

        return () => {
            active = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [imageRef]);

    return url;
};

interface BoxOverlay {
    rect: QaItem['rect'];
    index?: number;
}

// 캡처 이미지(뷰포트) 위에 요소 rect 박스 + index 번호를 그린다.
// rect는 getBoundingClientRect의 CSS px인데 naturalWidth는 captureVisibleTab의
// 물리 px(= CSS폭 × DPR)이라, 표시폭/naturalWidth로만 나누면 박스가 1/DPR로 줄어
// 좌상단으로 당겨진다. devicePixelRatio를 곱해 보정(lightbox.ts와 동일 공식).
const CapturedImage = ({ src, boxes, alt }: { src: string; boxes: BoxOverlay[]; alt: string }) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [scale, setScale] = useState(0);

    const updateScale = () => {
        const img = imgRef.current;
        if (img && img.naturalWidth > 0)
            setScale((img.clientWidth * window.devicePixelRatio) / img.naturalWidth);
    };

    useEffect(() => {
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [src]);

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                onLoad={updateScale}
                style={{ width: '100%', display: 'block', borderRadius: 4 }}
            />
            {scale > 0 &&
                boxes.map(({ rect, index }, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            top: rect.top * scale,
                            left: rect.left * scale,
                            width: rect.width * scale,
                            height: rect.height * scale,
                            border: '2px solid #2a72e5',
                            borderRadius: 2,
                            boxSizing: 'border-box',
                            pointerEvents: 'none',
                        }}
                    >
                        {index != null && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: -2,
                                    left: -2,
                                    background: '#2a72e5',
                                    color: '#fff',
                                    fontSize: 11,
                                    lineHeight: '16px',
                                    minWidth: 16,
                                    textAlign: 'center',
                                    borderRadius: 2,
                                    padding: '0 3px',
                                }}
                            >
                                {index}
                            </span>
                        )}
                    </div>
                ))}
        </div>
    );
};

interface ItemCardProps {
    /** 같은 imageRef를 공유하는 항목들(index 오름차순). 최소 1개. */
    group: QaItem[];
}

export const ItemCard = ({ group }: ItemCardProps) => {
    const head = group[0];
    const imageUrl = useImageUrl(head.imageRef);
    const alt = head.memo || head.selector;
    const boxes: BoxOverlay[] = group.map((item) => ({ rect: item.rect, index: item.index }));

    // sidepanel은 패널 폭을 못 벗어나므로, 확대는 활성 탭 페이지 위에 전체화면 오버레이로 띄운다.
    const openLightbox = () => {
        if (!head.imageRef) return;
        void sendMessage('openLightbox', {
            imageRef: head.imageRef,
            boxes,
            alt,
            tabId: head.tabId,
        }).catch(console.error);
    };

    return (
        <Card.Root>
            <Card.Body>
                <VStack $css={{ gap: '$200' }}>
                    {imageUrl ? (
                        <button
                            type="button"
                            onClick={openLightbox}
                            style={{
                                all: 'unset',
                                cursor: 'zoom-in',
                                display: 'block',
                                width: '100%',
                            }}
                        >
                            <CapturedImage src={imageUrl} alt={alt} boxes={boxes} />
                        </button>
                    ) : null}

                    <VStack $css={{ gap: '$200' }}>
                        {group.map((item) => (
                            <VStack key={item.id} $css={{ gap: '$050' }}>
                                <HStack $css={{ gap: '$100' }}>
                                    {item.index != null && (
                                        <Text typography="body2">#{item.index}</Text>
                                    )}
                                    <Text typography="body2">{item.memo || '(메모 없음)'}</Text>
                                </HStack>
                                {item.components && item.components.length > 0 && (
                                    <Text typography="subtitle2">
                                        {item.components.join(' › ')}
                                    </Text>
                                )}
                                <Text typography="subtitle2" foreground="hint-100">
                                    {item.selector}
                                </Text>

                                {item.styleJSON && Object.keys(item.styleJSON).length > 0 && (
                                    <Collapsible.Root>
                                        <Collapsible.Trigger>
                                            스타일 ({Object.keys(item.styleJSON).length})
                                        </Collapsible.Trigger>
                                        <Collapsible.Panel>
                                            <VStack $css={{ gap: '$050' }}>
                                                {Object.entries(item.styleJSON).map(
                                                    ([key, value]) => (
                                                        <HStack
                                                            key={key}
                                                            $css={{
                                                                gap: '$100',
                                                                justifyContent: 'space-between',
                                                            }}
                                                        >
                                                            <Text
                                                                typography="subtitle2"
                                                                foreground="hint-100"
                                                            >
                                                                {key}
                                                            </Text>
                                                            <Text typography="subtitle2">
                                                                {value}
                                                            </Text>
                                                        </HStack>
                                                    ),
                                                )}
                                            </VStack>
                                        </Collapsible.Panel>
                                    </Collapsible.Root>
                                )}
                            </VStack>
                        ))}
                    </VStack>
                </VStack>
            </Card.Body>
        </Card.Root>
    );
};
