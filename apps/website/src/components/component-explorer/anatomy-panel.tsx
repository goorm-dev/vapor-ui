'use client';

import { type KeyboardEvent, useCallback, useId, useMemo, useRef } from 'react';

import { Button, Text } from '@vapor-ui/core';

import { PartButton } from './part-button';
import type { Part } from './types';

interface AnatomyPanelProps {
    componentName: string;
    parts: Part[];
    hoveredPart: string | null;
    pinnedPart: string | null;
    onPartHover: (partName: string | null) => void;
    onPartClick: (partName: string) => void;
    showPrimitives?: boolean;
    availableParts: string[] | null;
    selectedPart: string | null;
    canMoveToProps: boolean;
    onMoveToProps: () => void;
    onClearSelection: () => void;
}

export function AnatomyPanel({
    componentName,
    parts,
    hoveredPart,
    pinnedPart,
    onPartHover,
    onPartClick,
    showPrimitives = false,
    availableParts,
    selectedPart,
    canMoveToProps,
    onMoveToProps,
    onClearSelection,
}: AnatomyPanelProps) {
    const sectionRef = useRef<HTMLElement | null>(null);
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
    const handlePartClick = useCallback((partName: string) => onPartClick(partName), [onPartClick]);
    const handlePartNavigationKeyDown = useCallback(
        (event: KeyboardEvent<HTMLElement>) => {
            if (event.key === 'Escape') {
                onClearSelection();
                event.preventDefault();
                return;
            }

            if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
                return;
            }

            const root = sectionRef.current;
            if (!root) return;

            const buttons = Array.from(
                root.querySelectorAll<HTMLButtonElement>('[data-explorer-part-button="true"]'),
            );

            if (buttons.length === 0) return;

            const activeElement = document.activeElement;
            const currentIndex = buttons.findIndex((button) => button === activeElement);

            let nextIndex = 0;

            if (event.key === 'Home') {
                nextIndex = 0;
            } else if (event.key === 'End') {
                nextIndex = buttons.length - 1;
            } else if (event.key === 'ArrowDown') {
                nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % buttons.length;
            } else if (event.key === 'ArrowUp') {
                nextIndex =
                    currentIndex === -1
                        ? buttons.length - 1
                        : (currentIndex - 1 + buttons.length) % buttons.length;
            }

            buttons[nextIndex]?.focus();
            event.preventDefault();
        },
        [onClearSelection],
    );

    return (
        <section
            ref={sectionRef}
            aria-label="Component anatomy"
            aria-describedby={instructionsId}
            onKeyDown={handlePartNavigationKeyDown}
            className="w-full md:w-56 flex-shrink-0 border-b md:border-b-0 md:border-r border-v-normal-200 bg-v-canvas-100 max-h-[320px] md:max-h-[420px] flex flex-col"
        >
            <p id={instructionsId} className="sr-only">
                Use up and down arrow keys to move between parts. Press Enter or Space to select a
                part, and Escape to clear selection.
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
                <div role="list" className="p-2">
                    {mainParts.map((part) => (
                        <div role="listitem" key={part.name}>
                            <PartButton
                                partName={part.name}
                                displayName={componentName}
                                isHovered={hoveredPart === part.name}
                                isPinned={pinnedPart === part.name}
                                onClick={handlePartClick}
                                onMouseEnter={handlePartHover}
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
                                        isPinned={pinnedPart === part.name}
                                        onClick={handlePartClick}
                                        onMouseEnter={handlePartHover}
                                        onMouseLeave={handleMouseLeave}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {selectedPart && (
                <div className="border-t border-v-normal-200 p-2">
                    <Button
                        size="sm"
                        variant="outline"
                        color="neutral"
                        className="w-full"
                        disabled={!canMoveToProps}
                        onClick={onMoveToProps}
                    >
                        Props Table로 이동
                    </Button>
                </div>
            )}
        </section>
    );
}
