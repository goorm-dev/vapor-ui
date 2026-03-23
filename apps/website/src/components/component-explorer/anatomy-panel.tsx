'use client';

import { type KeyboardEvent, memo, useCallback, useId, useMemo } from 'react';

import { RadioGroup, Text } from '@vapor-ui/core';

import { PartButton } from './part-button';

export interface AnatomyPanelProps {
    componentName: string;
    parts: string[];
    selectedPart: string | null;
    onPartHover: (partName: string | null) => void;
    onPartSelect: (value: unknown) => void;
    showPrimitives?: boolean;
    onClearSelection: () => void;
}

function isPrimitivePart(partName: string) {
    return partName.endsWith('Primitive');
}

export const AnatomyPanel = memo(function AnatomyPanel({
    componentName,
    parts,
    selectedPart,
    onPartHover,
    onPartSelect,
    showPrimitives = false,
    onClearSelection,
}: AnatomyPanelProps) {
    const instructionsId = useId();

    const { filteredParts, mainParts, primitiveParts } = useMemo(() => {
        const filtered = showPrimitives ? parts : parts.filter((part) => !isPrimitivePart(part));

        return {
            filteredParts: filtered,
            mainParts: filtered.filter((part) => !isPrimitivePart(part)),
            primitiveParts: filtered.filter((part) => isPrimitivePart(part)),
        };
    }, [parts, showPrimitives]);

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
                    {mainParts.map((partName) => (
                        <PartButton
                            key={partName}
                            partName={partName}
                            displayName={componentName}
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
                            {primitiveParts.map((partName) => (
                                <PartButton
                                    key={partName}
                                    partName={partName}
                                    displayName={componentName}
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
});
