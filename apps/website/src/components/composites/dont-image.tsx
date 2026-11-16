import { Text, VStack } from '@vapor-ui/core';
import { ErrorCircleIcon } from '@vapor-ui/icons';

import { ImageZoom } from './image-zoom';

interface DontImageProps {
    src: string;
    alt: string;
    caption: string;
    width?: number;
    height?: number;
}

export const DontImage = ({ src, alt, caption, width = 400, height = 300 }: DontImageProps) => {
    return (
        <VStack render={<figure />} className="gap-v-150">
            <div className="rounded-v-500 bg-v-canvas-raised flex items-center justify-center overflow-hidden">
                <ImageZoom src={src} alt={alt} width={width} height={height} />
            </div>
            <figcaption className="flex gap-v-100">
                <ErrorCircleIcon aria-hidden className="text-v-danger shrink-0 w-v-300 h-v-300" />
                <Text typography="body2" foreground="secondary" className="leading-v-100">
                    {caption}
                </Text>
            </figcaption>
        </VStack>
    );
};
