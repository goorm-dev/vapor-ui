import { ImageZoom as FumadocsImageZoom } from 'fumadocs-ui/components/image-zoom';
import NextImage from 'next/image';

interface ImageZoomProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
}

export const ImageZoom = ({ src, alt, width = 400, height = 300 }: ImageZoomProps) => {
    return (
        <FumadocsImageZoom>
            <NextImage
                src={src}
                alt={alt}
                width={width}
                height={height}
                className="object-cover w-full h-auto not-prose"
                unoptimized
            />
        </FumadocsImageZoom>
    );
};
