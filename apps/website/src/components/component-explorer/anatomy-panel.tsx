'use client';

import { type KeyboardEvent, useCallback, useId, useMemo } from 'react';

import { RadioGroup, Text } from '@vapor-ui/core';

import { PartButton } from './part-button';
import type { Part } from './types';

interface AnatomyPanelProps {
    componentName: string;
    parts: Part[];
    hoveredPart: string | null;
    selectedPart: string | null;
    onPartHover: (partName: string | null) => void;
    onPartSelect: (value: unknown) => void;
    showPrimitives?: boolean;
    availableParts: string[] | null;
    onClearSelection: () => void;
}

export function AnatomyPanel({
    componentName,
    parts,
    hoveredPart,
    selectedPart,
    onPartHover,
    onPartSelect,
    showPrimitives = false,
    availableParts,
    onClearSelection,
}: AnatomyPanelProps) {
    const instructionsId = useId();

    const { filteredParts, mainParts, primitiveParts } = useMemo(() => {
        let filtered = showPrimitives ? parts : parts.filter((part) => !part.isPrimitive);

        if (availableParts !== null) {
            filtered = filtered.filter((part) => availableParts.includes(part.name));
        }

        return {
            filteredParts: filtered,
            mainParts: filtered.filter((p) => !p.isPrimitive),
            primitiveParts: filtered.filter((p) => p.isPrimitive),
        };
    }, [parts, showPrimitives, availableParts]);

    const handlePartHover = useCallback((partName: string) => onPartHover(partName), [onPartHover]);
    const handleMouseLeave = useCallback(() => onPartHover(null), [onPartHover]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLElement>) => {
            if (event.key === 'Escape') {
                onClearSelection();
                event.preventDefault();
            }
        },
        [onClearSelection],
    );

    return (
        <RadioGroup.Root
            value={selectedPart ?? ''}
            onValueChange={onPartSelect}
            aria-label="Component anatomy"
            aria-describedby={instructionsId}
            onKeyDown={handleKeyDown}
            className="w-full md:w-56 flex-shrink-0 border-b md:border-b-0 md:border-r border-v-normal-200 bg-v-canvas-100 max-h-[320px] md:max-h-[420px] flex flex-col"
        >
            <p id={instructionsId} className="sr-only">
                Use arrow keys to move between parts. Press Escape to clear selection.
            </p>
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
            <div className="flex-1 overflow-y-auto overscroll-contain">
                {/* Main Parts */}
                <div className="p-2">
                    {mainParts.map((part) => (
                        <PartButton
                            key={part.name}
                            partName={part.name}
                            displayName={componentName}
                            isHovered={hoveredPart === part.name}
                            onMouseEnter={handlePartHover}
                            onMouseLeave={handleMouseLeave}
                        />
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
                        <div className="px-2 pb-2">
                            {primitiveParts.map((part) => (
                                <PartButton
                                    key={part.name}
                                    partName={part.name}
                                    displayName={componentName}
                                    isHovered={hoveredPart === part.name}
                                    onMouseEnter={handlePartHover}
                                    onMouseLeave={handleMouseLeave}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </RadioGroup.Root>
    );
}
