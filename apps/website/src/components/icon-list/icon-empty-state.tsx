import { Flex, Text, VStack } from '@vapor-ui/core';
import { SearchOutlineIcon } from '@vapor-ui/icons';

type IconEmptyStateProps = {
    search: string;
};

const IconEmptyState = ({ search }: IconEmptyStateProps) => {
    return (
        <VStack
            role="status"
            aria-live="polite"
            $css={{
                alignItems: 'center',
                justifyContent: 'center',
                gap: '$200',
                minHeight: '16rem',
                padding: '$400',
                borderRadius: '$400',
                backgroundColor: '$bg-secondary-100',
                border: '1px solid',
                borderColor: '$border-normal',
            }}
        >
            <Flex
                aria-hidden="true"
                $css={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '3.5rem',
                    height: '3.5rem',
                    borderRadius: '$400',
                    backgroundColor: '$bg-secondary-200',
                    color: '$text-secondary-200',
                }}
            >
                <SearchOutlineIcon size="28" />
            </Flex>
            <VStack $css={{ alignItems: 'center', gap: '$050', textAlign: 'center' }}>
                <Text typography="body2" foreground="secondary-200">
                    &quot;{search}&quot; 검색 결과가 없습니다
                </Text>
                <Text typography="body2" foreground="secondary-200">
                    다른 키워드로 검색해 보세요
                </Text>
            </VStack>
        </VStack>
    );
};

export default IconEmptyState;
