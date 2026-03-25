'use client';

import { type KeyboardEvent, memo, useCallback, useId, useMemo, useRef } from 'react';

import { Text } from '@vapor-ui/core';

import { PartOption } from './part-option';

export interface AnatomyPanelProps {
    componentName: string;
    parts: string[];
    selectedPart: string | null;
    onPartHover: (partName: string | null) => void;
    onPartFocus: (partName: string) => void;
    onPartSelect: (partName: string) => void;
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
    onPartFocus,
    onPartSelect,
    showPrimitives = false,
    onClearSelection,
}: AnatomyPanelProps) {
    const instructionsId = useId();
    const listRef = useRef<HTMLDivElement>(null);

    const { filteredParts, mainParts, primitiveParts } = useMemo(() => {
        const filtered = showPrimitives ? parts : parts.filter((part) => !isPrimitivePart(part));

        const main = filtered.filter((part) => !isPrimitivePart(part));
        const primitives = filtered.filter((part) => isPrimitivePart(part));

        return {
            filteredParts: [...main, ...primitives],
            mainParts: main,
            primitiveParts: primitives,
        };
    }, [parts, showPrimitives]);

    const handlePartHover = useCallback((partName: string) => onPartHover(partName), [onPartHover]);
    const handleMouseLeave = useCallback(() => onPartHover(null), [onPartHover]);
    const initialFocusablePart = filteredParts[0] ?? null;

    const focusOption = useCallback((partName: string) => {
        const element = listRef.current?.querySelector<HTMLElement>(`[id="part-${partName}"]`);
        if (element) {
            element.focus();
        }
    }, []);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLElement>) => {
            const { key } = event;
            const active = document.activeElement;
            const currentId = active?.id;
            const currentPart = currentId?.startsWith('part-') ? currentId.slice(5) : null;
            const currentIndex = currentPart ? filteredParts.indexOf(currentPart) : -1;

            let nextIndex: number | null = null;

            switch (key) {
                case 'ArrowDown':
                    nextIndex = currentIndex < filteredParts.length - 1 ? currentIndex + 1 : 0;
                    break;
                case 'ArrowUp':
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : filteredParts.length - 1;
                    break;
                case 'Home':
                    nextIndex = 0;
                    break;
                case 'End':
                    nextIndex = filteredParts.length - 1;
                    break;
                case 'Escape':
                    onClearSelection();
                    event.preventDefault();
                    return;
                default:
                    return;
            }

            if (nextIndex !== null) {
                const nextPart = filteredParts[nextIndex];
                focusOption(nextPart);
                event.preventDefault();
            }
        },
        [filteredParts, onClearSelection, focusOption],
    );

    return (
        <div
            role="listbox"
            aria-label="Component structure"
            aria-orientation="vertical"
            aria-describedby={instructionsId}
            ref={listRef}
            // Options receive focus via roving tabindex; listbox itself is excluded from tab order
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            onMouseLeave={handleMouseLeave}
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
                <div className="p-2" role="group" aria-label="Parts">
                    {mainParts.map((partName) => (
                        <PartOption
                            key={partName}
                            partName={partName}
                            displayName={componentName}
                            isSelected={selectedPart === partName}
                            tabIndex={
                                selectedPart
                                    ? selectedPart === partName
                                        ? 0
                                        : -1
                                    : initialFocusablePart === partName
                                      ? 0
                                      : -1
                            }
                            onMouseEnter={handlePartHover}
                            onFocus={onPartFocus}
                            onClick={onPartSelect}
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
                        <div className="px-2 pb-2" role="group" aria-label="Primitives">
                            {primitiveParts.map((partName) => (
                                <PartOption
                                    key={partName}
                                    partName={partName}
                                    displayName={componentName}
                                    isSelected={selectedPart === partName}
                                    tabIndex={
                                        selectedPart
                                            ? selectedPart === partName
                                                ? 0
                                                : -1
                                            : initialFocusablePart === partName
                                              ? 0
                                              : -1
                                    }
                                    onMouseEnter={handlePartHover}
                                    onFocus={onPartFocus}
                                    onClick={onPartSelect}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});
