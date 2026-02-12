'use client';

import { useCallback, useMemo } from 'react';

import { Text } from '@vapor-ui/core';

import { PartButton } from './part-button';
import type { Part } from './types';

interface AnatomyPanelProps {
    componentName: string;
    parts: Part[];
    hoveredPart: string | null;
    onPartHover: (partName: string | null) => void;
    showPrimitives?: boolean;
}

export function AnatomyPanel({
    componentName,
    parts,
    hoveredPart,
    onPartHover,
    showPrimitives = false,
}: AnatomyPanelProps) {
    const { filteredParts, mainParts, primitiveParts } = useMemo(() => {
        const filtered = showPrimitives ? parts : parts.filter((part) => !part.isPrimitive);
        return {
            filteredParts: filtered,
            mainParts: filtered.filter((p) => !p.isPrimitive),
            primitiveParts: filtered.filter((p) => p.isPrimitive),
        };
    }, [parts, showPrimitives]);

    const handleMouseEnter = useCallback(
        (partName: string) => () => onPartHover(partName),
        [onPartHover],
    );
    const handleMouseLeave = useCallback(() => onPartHover(null), [onPartHover]);

    return (
        <section
            aria-label="Component anatomy"
            className="w-56 flex-shrink-0 border-r border-v-normal-200 bg-v-canvas-100 max-h-[420px] overflow-y-auto overscroll-contain"
        >
            {/* Header */}
            <div className="px-3 py-3 border-b border-v-normal-200">
                <div className="flex items-center justify-between">
                    <Text
                        typography="body3"
                        foreground="normal-100"
                        className="font-semibold uppercase tracking-wide"
                    >
                        Parts
                    </Text>
                    <Text typography="body3" foreground="normal-100" className="opacity-50">
                        {filteredParts.length} items
                    </Text>
                </div>
            </div>

            {/* Main Parts */}
            <div role="list" className="p-2">
                {mainParts.map((part) => (
                    <div role="listitem" key={part.name}>
                        <PartButton
                            partName={part.name}
                            displayName={componentName}
                            isHovered={hoveredPart === part.name}
                            onMouseEnter={handleMouseEnter(part.name)}
                            onMouseLeave={handleMouseLeave}
                        />
                    </div>
                ))}
            </div>

            {/* Primitives Section */}
            {primitiveParts.length > 0 && (
                <div className="border-t border-v-normal-200">
                    <div className="px-3 py-2">
                        <Text
                            typography="body3"
                            foreground="normal-100"
                            className="uppercase tracking-wider opacity-50"
                        >
                            Primitives
                        </Text>
                    </div>
                    <div role="list" className="px-2 pb-2">
                        {primitiveParts.map((part) => (
                            <div role="listitem" key={part.name}>
                                <PartButton
                                    partName={part.name}
                                    displayName={componentName}
                                    isHovered={hoveredPart === part.name}
                                    onMouseEnter={handleMouseEnter(part.name)}
                                    onMouseLeave={handleMouseLeave}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
