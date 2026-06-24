import { useEffect, useRef, useState } from 'react';

import { Card, Dialog, HStack, Text, VStack } from '@vapor-ui/core';

import { getImage } from '../../utils/image-store';
import type { QaItem } from '../../utils/session-store';

const useImageUrl = (imageRef?: string) => {
    const [url, setUrl] = useState<string>();

    useEffect(() => {
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
// 이미지는 width:100%로 축소되므로 표시폭/naturalWidth 비율로 스케일한다(dpr 자동 흡수).
const CapturedImage = ({ src, boxes, alt }: { src: string; boxes: BoxOverlay[]; alt: string }) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [scale, setScale] = useState(0);

    const updateScale = () => {
        const img = imgRef.current;
        if (img && img.naturalWidth > 0) setScale(img.clientWidth / img.naturalWidth);
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
    item: QaItem;
    /** 같은 이미지를 공유하는 모든 항목(확대 보기에서 전체 박스 표시용) */
    siblings: QaItem[];
}

export const ItemCard = ({ item, siblings }: ItemCardProps) => {
    const imageUrl = useImageUrl(item.imageRef);
    const alt = item.memo || item.selector;
    const allBoxes: BoxOverlay[] = siblings.map((s) => ({ rect: s.rect, index: s.index }));

    return (
        <Card.Root>
            <Card.Body>
                <VStack gap="$200">
                    {imageUrl ? (
                        <Dialog.Root>
                            <Dialog.Trigger
                                render={
                                    <button
                                        type="button"
                                        style={{
                                            all: 'unset',
                                            cursor: 'zoom-in',
                                            display: 'block',
                                            width: '100%',
                                        }}
                                    />
                                }
                            >
                                <CapturedImage
                                    src={imageUrl}
                                    alt={alt}
                                    boxes={[{ rect: item.rect, index: item.index }]}
                                />
                            </Dialog.Trigger>
                            <Dialog.Popup>
                                <Dialog.Title>캡처 확대 ({siblings.length}개 항목)</Dialog.Title>
                                <Dialog.Body>
                                    <CapturedImage src={imageUrl} alt={alt} boxes={allBoxes} />
                                </Dialog.Body>
                                <Dialog.Close>닫기</Dialog.Close>
                            </Dialog.Popup>
                        </Dialog.Root>
                    ) : null}

                    <HStack gap="$100">
                        {item.index != null && <Text typography="body2">#{item.index}</Text>}
                        <Text typography="body2">{item.memo || '(메모 없음)'}</Text>
                    </HStack>
                    <Text typography="subtitle2" foreground="hint-100">
                        {item.selector}
                    </Text>

                    <VStack gap="$050">
                        {Object.entries(item.styleJSON ?? {}).map(([key, value]) => (
                            <HStack key={key} gap="$100" justifyContent="space-between">
                                <Text typography="subtitle2" foreground="hint-100">
                                    {key}
                                </Text>
                                <Text typography="subtitle2">{value}</Text>
                            </HStack>
                        ))}
                    </VStack>
                </VStack>
            </Card.Body>
        </Card.Root>
    );
};
