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

    const selectPart = useCallback(
        (partName: string, options?: { announce?: boolean }) => {
            const { announce = true } = options ?? {};

            setSelectedPart((prev) => {
                if (prev === partName) return prev;

                if (announce) {
                    setLiveAnnouncement(`${displayName}.${partName} 선택됨`);
                }

                return partName;
            });
        },
        [displayName],
    );

    const handlePartFocus = useCallback(
        (partName: string) => {
            setHoveredPart(partName);
            selectPart(partName, { announce: false });
        },
        [selectPart],
    );

    const handlePartSelect = useCallback(
        (partName: string) => {
            setHoveredPart(partName);
            selectPart(partName);
        },
        [selectPart],
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
        handlePartFocus,
        handlePartSelect,
        handleClearSelection,
    };
}
