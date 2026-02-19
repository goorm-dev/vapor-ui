'use client';

import { Box, Card, Flex, Grid, HStack, Text } from '@vapor-ui/core';
import {
    CheckCircleIcon,
    CheckCircleOutlineIcon,
    SlackColorIcon,
    SlackIcon,
} from '@vapor-ui/icons';

const STYLE_CARDS = [
    {
        id: 'basic',
        title: 'Basic',
        description: '채워진 실선 스타일. 주요 액션이나 강조가 필요한 요소에 사용합니다.',
        usage: '버튼, 상태 표시, 주요 UI 요소',
        icon: CheckCircleIcon,
        naming: '*Icon',
    },
    {
        id: 'outline',
        title: 'Outline',
        description: '외곽선만 있는 스타일. 보조 요소나 덜 강조된 UI에 적합합니다.',
        usage: '보조 버튼, 리스트 아이템, 내비게이션',
        icon: CheckCircleOutlineIcon,
        naming: '*OutlineIcon',
    },
    {
        id: 'symbol',
        title: 'Symbol',
        description: '브랜드 원본 색상을 유지하는 아이콘. 서비스 로고나 국기 등에 사용합니다.',
        usage: '소셜 로그인, 브랜드 표시, 국가 선택',
        icon: SlackColorIcon,
        naming: '*ColorIcon',
    },
    {
        id: 'symbol-black',
        title: 'Symbol Black',
        description: '단색으로 표현된 브랜드 아이콘. 색상 통일이 필요한 UI에 적합합니다.',
        usage: '푸터 링크, 단색 UI, 프린트용',
        icon: SlackIcon,
        naming: '*Icon (symbol)',
    },
] as const;

const IconStyleGuide = () => {
    return (
        <Grid.Root
            role="list"
            aria-label="아이콘 스타일 가이드"
            templateColumns="repeat(auto-fit, minmax(280px, 1fr))"
            $css={{ gap: '$150', marginBlock: '$300' }}
        >
            {STYLE_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                    <Card.Root key={card.id} role="listitem" $css={{ overflow: 'hidden' }}>
                        {/* 아이콘 프리뷰 영역 */}
                        <Flex
                            aria-hidden="true"
                            $css={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingBlock: '$400',
                                backgroundColor: '$bg-secondary-100',
                            }}
                        >
                            <Icon size="48" />
                        </Flex>

                        {/* 컨텐츠 영역 */}
                        <Card.Body
                            $css={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '$150',
                                padding: '$200',
                            }}
                        >
                            <Box>
                                <HStack
                                    $css={{
                                        alignItems: 'center',
                                        gap: '$100',
                                        marginBottom: '$075',
                                    }}
                                >
                                    <Text typography="subtitle1">{card.title}</Text>
                                    <Box
                                        $css={{
                                            paddingInline: '$075',
                                            paddingBlock: '$025',
                                            borderRadius: '$200',
                                            backgroundColor: '$bg-secondary-100',
                                        }}
                                    >
                                        <Text typography="body3">{card.naming}</Text>
                                    </Box>
                                </HStack>
                                <Text typography="body3" foreground="secondary-200">
                                    {card.description}
                                </Text>
                            </Box>
                        </Card.Body>

                        <Card.Footer>
                            <Text
                                typography="body3"
                                foreground="secondary-200"
                                className="text-[11px]"
                            >
                                용도: {card.usage}
                            </Text>
                        </Card.Footer>
                    </Card.Root>
                );
            })}
        </Grid.Root>
    );
};

export default IconStyleGuide;
