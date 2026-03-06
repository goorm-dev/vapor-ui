import type { KeyboardEvent, RefObject } from 'react';

import { Box, Flex, IconButton, TextInput } from '@vapor-ui/core';
import { CloseOutlineIcon, SearchOutlineIcon } from '@vapor-ui/icons';

type IconSearchBarProps = {
    search: string;
    totalCount: number;
    inputRef: RefObject<HTMLInputElement | null>;
    setSearch: (value: string) => void;
};

const IconSearchBar = ({ search, totalCount, inputRef, setSearch }: IconSearchBarProps) => {
    const clearSearch = () => {
        setSearch('');
        inputRef.current?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && search) {
            clearSearch();
        }
    };

    return (
        <Box
            $css={{
                position: 'relative',
                paddingBlock: '$150',
                backgroundColor: '$bg-canvas-100',
            }}
        >
            <Box $css={{ position: 'relative' }}>
                <TextInput
                    ref={inputRef}
                    placeholder={`${totalCount.toLocaleString()}개의 아이콘 검색...`}
                    value={search}
                    onValueChange={setSearch}
                    onKeyDown={handleKeyDown}
                    size="lg"
                    aria-label="아이콘 검색"
                    $css={{ width: '100%', paddingLeft: '$500' }}
                />
                <Flex
                    $css={{
                        position: 'absolute',
                        left: '$175',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '$fg-success-200',
                        pointerEvents: 'none',
                    }}
                >
                    <SearchOutlineIcon size="18" aria-hidden="true" />
                </Flex>
                {search && (
                    <Box
                        $css={{
                            position: 'absolute',
                            right: '$150',
                            top: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <IconButton
                            variant="ghost"
                            size="sm"
                            onClick={clearSearch}
                            aria-label="검색어 지우기"
                        >
                            <CloseOutlineIcon size="16" />
                        </IconButton>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default IconSearchBar;
