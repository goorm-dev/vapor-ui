import { Text, VStack } from '@vapor-ui/core';
import { CheckCircleIcon } from '@vapor-ui/icons';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';

interface DoImageProps {
    src: string;
    alt: string;
    caption: string;
    width?: number;
    height?: number;
}

export const DoImage = ({ src, alt, caption, width = 400, height = 300 }: DoImageProps) => {
    return (
        <VStack render={<figure />} className="gap-v-150">
            <div className="rounded-v-500 bg-v-canvas-raised flex items-center justify-center overflow-hidden">
                <ImageZoom
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    className="object-cover w-full h-auto not-prose"
                />
            </div>
            <figcaption className="flex gap-v-100">
                <CheckCircleIcon aria-hidden className="text-v-success shrink-0 w-v-300 h-v-300" />
                <Text typography="body2" foreground="secondary" className="leading-v-100">
                    {caption}
                </Text>
            </figcaption>
        </VStack>
    );
};
