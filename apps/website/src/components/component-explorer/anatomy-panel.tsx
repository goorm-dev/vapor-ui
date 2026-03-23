'use client';

import { type KeyboardEvent, memo, useCallback, useId, useMemo, useRef } from 'react';

import { Text } from '@vapor-ui/core';

import { PartOption } from './part-option';

export interface AnatomyPanelProps {
    componentName: string;
    parts: string[];
    selectedPart: string | null;
    onPartHover: (partName: string | null) => void;
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
    onPartSelect,
    showPrimitives = false,
    onClearSelection,
}: AnatomyPanelProps) {
    const instructionsId = useId();
    const listRef = useRef<HTMLUListElement>(null);

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

    const focusOption = useCallback((partName: string) => {
        const element = listRef.current?.querySelector(`#part-${partName}`);
        if (element instanceof HTMLElement) {
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
                onPartHover(nextPart);
                event.preventDefault();
            }
        },
        [filteredParts, onClearSelection, onPartHover, focusOption],
    );

    return (
        <ul
            role="listbox"
            aria-label="Component anatomy"
            aria-orientation="vertical"
            aria-describedby={instructionsId}
            ref={listRef}
            onKeyDown={handleKeyDown}
            className="w-full md:w-56 flex-shrink-0 border-b md:border-b-0 md:border-r border-v-normal-200 bg-v-canvas-100 max-h-[320px] md:max-h-[420px] flex flex-col list-none p-0 m-0"
        >
            <p id={instructionsId} className="sr-only">
                Use arrow keys to move between parts. Press Escape to clear selection.
            </p>
            {/* Header */}
            <div className="px-3 py-3 border-b border-v-normal-200" role="presentation">
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
            <div className="flex-1 overflow-y-auto overscroll-contain" role="presentation">
                {/* Main Parts */}
                <li role="presentation" className="p-2 list-none">
                    <ul role="group" aria-label="Parts" className="list-none p-0 m-0">
                        {mainParts.map((partName, index) => (
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
                                        : index === 0
                                          ? 0
                                          : -1
                                }
                                onMouseEnter={handlePartHover}
                                onMouseLeave={handleMouseLeave}
                                onFocus={handlePartHover}
                                onClick={onPartSelect}
                            />
                        ))}
                    </ul>
                </li>

                {/* Primitives Section */}
                {primitiveParts.length > 0 && (
                    <li role="presentation" className="border-t border-v-normal-200 list-none">
                        <div className="px-3 py-2" role="presentation">
                            <Text
                                typography="body3"
                                foreground="normal-100"
                                className="uppercase tracking-wider opacity-50"
                            >
                                Primitives
                            </Text>
                        </div>
                        <ul
                            role="group"
                            aria-label="Primitives"
                            className="list-none px-2 pb-2 m-0"
                        >
                            {primitiveParts.map((partName) => (
                                <PartOption
                                    key={partName}
                                    partName={partName}
                                    displayName={componentName}
                                    isSelected={selectedPart === partName}
                                    tabIndex={selectedPart === partName ? 0 : -1}
                                    onMouseEnter={handlePartHover}
                                    onMouseLeave={handleMouseLeave}
                                    onFocus={handlePartHover}
                                    onClick={onPartSelect}
                                />
                            ))}
                        </ul>
                    </li>
                )}
            </div>
        </ul>
    );
});
