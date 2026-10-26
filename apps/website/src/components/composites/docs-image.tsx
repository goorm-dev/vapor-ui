import { Text, VStack } from '@vapor-ui/core';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';

interface DocsImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    caption?: string;
}

export const DocsImage = ({ src, alt, width = 868, height = 480, caption }: DocsImageProps) => {
    return (
        <VStack render={<figure />} className="gap-v-150">
            <ImageZoom
                src={src}
                alt={alt}
                width={width}
                height={height}
                className="object-cover w-full h-auto not-prose"
            />
            {caption && (
                <Text typography="body2" foreground="secondary" className="leading-v-100">
                    {caption}
                </Text>
            )}
        </VStack>
    );
};
