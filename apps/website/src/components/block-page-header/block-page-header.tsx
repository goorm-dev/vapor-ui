import { Text } from '@vapor-ui/core';
import Image from 'next/image';

import { CopyButton } from '../copy-button';

interface BlockPageHeaderProps {
    title: string;
    description?: string;
    previewImageUrl?: string;
}

export const BlockPageHeader = ({ title, description, previewImageUrl }: BlockPageHeaderProps) => {
    return (
        <div className="flex gap-8 items-start justify-between w-full max-[1200px]:flex-col">
            {/* Header Section */}
            <div className="flex  flex-col gap-[var(--vapor-size-space-250)] items-start justify-start min-w-[424px]">
                <div className="flex flex-col gap-[var(--vapor-size-space-100)] items-start justify-start w-full">
                    <Text asChild typography="heading1" foreground="normal">
                        <h1 className="text-[38px] leading-[56px] tracking-[-0.4px] font-bold">
                            {title}
                        </h1>
                    </Text>

                    {description && (
                        <Text asChild typography="body1" foreground="normal">
                            <div className="text-[16px] leading-[24px] tracking-[-0.1px] w-full">
                                {description.split('\n').map((line, index) => (
                                    <p key={index} className={index === 0 ? 'mb-0' : ''}>
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </Text>
                    )}
                </div>
                <CopyButton markdownUrl="/" />
            </div>

            {/* Preview Section */}

            {previewImageUrl && (
                <div className="bg-[var(--vapor-color-background-normal-darker)] flex items-center justify-center px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-400)] rounded-[var(--vapor-size-borderRadius-500)] border border-[var(--vapor-color-border-normal)] w-full">
                    <div className="flex flex-col items-center justify-center overflow-hidden rounded-[8px] w-full">
                        <Image
                            src={previewImageUrl}
                            alt={`${title} preview`}
                            width={590}
                            height={335}
                            className="object-cover"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
