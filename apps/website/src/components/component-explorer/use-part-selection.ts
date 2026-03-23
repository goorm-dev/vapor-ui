'use client';

import { useCallback, useEffect, useState } from 'react';

interface UsePartSelectionOptions {
    componentName: string;
    displayName: string;
    availableParts: string[] | null;
}

export function usePartSelection({
    componentName,
    displayName,
    availableParts,
}: UsePartSelectionOptions) {
    const [hoveredPart, setHoveredPart] = useState<string | null>(null);
    const [selectedPart, setSelectedPart] = useState<string | null>(null);
    const [liveAnnouncement, setLiveAnnouncement] = useState('');

    useEffect(() => {
        setSelectedPart(null);
        setHoveredPart(null);
        setLiveAnnouncement('');
    }, [componentName]);

    useEffect(() => {
        if (!availableParts) return;

        setSelectedPart((prev) => (prev && !availableParts.includes(prev) ? null : prev));
        setHoveredPart((prev) => (prev && !availableParts.includes(prev) ? null : prev));
    }, [availableParts]);

    const handlePartHover = useCallback((partName: string | null) => {
        setHoveredPart(partName);
    }, []);

    const handlePartSelect = useCallback(
        (partName: string) => {
            setSelectedPart((prev) => {
                const next = prev === partName ? null : partName;
                setLiveAnnouncement(
                    next ? `${displayName}.${next} 선택됨` : '파트 선택이 해제되었습니다.',
                );
                return next;
            });
        },
        [displayName],
    );

    const handleClearSelection = useCallback(() => {
        setSelectedPart(null);
        setHoveredPart(null);
        setLiveAnnouncement('파트 선택이 해제되었습니다.');
    }, []);

    return {
        activePart: hoveredPart ?? selectedPart,
        selectedPart,
        liveAnnouncement,
        handlePartHover,
        handlePartSelect,
        handleClearSelection,
    };
}
