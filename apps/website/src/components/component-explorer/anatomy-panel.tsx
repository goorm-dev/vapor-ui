'use client';

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
    const filteredParts = showPrimitives ? parts : parts.filter((part) => !part.isPrimitive);
    const mainParts = filteredParts.filter((p) => !p.isPrimitive);
    const primitiveParts = filteredParts.filter((p) => p.isPrimitive);

    return (
        <nav
            aria-label="Component anatomy"
            className="w-56 flex-shrink-0 border-r border-v-normal-200 bg-v-canvas-100 max-h-[420px] overflow-y-auto overscroll-contain"
        >
            {/* Header */}
            <div className="px-3 py-3 border-b border-v-normal-200">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-v-normal-700 uppercase tracking-wide">
                        Parts
                    </span>
                    <span className="text-[10px] text-v-normal-400">
                        {filteredParts.length} items
                    </span>
                </div>
            </div>

            {/* Main Parts */}
            <div role="list" className="p-2">
                {mainParts.map((part, index) => (
                    <div role="listitem" key={part.name}>
                        <PartButton
                            partName={part.name}
                            displayName={componentName}
                            isHovered={hoveredPart === part.name}
                            isPrimitive={part.isPrimitive}
                            index={index}
                            onMouseEnter={() => onPartHover(part.name)}
                            onMouseLeave={() => onPartHover(null)}
                        />
                    </div>
                ))}
            </div>

            {/* Primitives Section */}
            {primitiveParts.length > 0 && (
                <div className="border-t border-v-normal-200">
                    <div className="px-3 py-2">
                        <span className="text-[10px] font-medium text-v-normal-400 uppercase tracking-wider">
                            Primitives
                        </span>
                    </div>
                    <div role="list" className="px-2 pb-2">
                        {primitiveParts.map((part, index) => (
                            <div role="listitem" key={part.name}>
                                <PartButton
                                    partName={part.name}
                                    displayName={componentName}
                                    isHovered={hoveredPart === part.name}
                                    isPrimitive={part.isPrimitive}
                                    index={mainParts.length + index}
                                    onMouseEnter={() => onPartHover(part.name)}
                                    onMouseLeave={() => onPartHover(null)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
