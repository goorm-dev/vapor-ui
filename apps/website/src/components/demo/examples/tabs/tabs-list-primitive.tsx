import { Tabs, Badge, VStack, HStack, Box } from '@vapor-ui/core';

export default function TabsListPrimitive() {
    return (
        <VStack gap="$500">
            <VStack gap="$200">
                <h4 className="text-sm font-medium">복잡한 레이아웃 구성</h4>
                <Tabs.Root defaultValue="overview">
                    <Box
                        padding="$200"
                        border="1px solid"
                        borderColor="$gray-200"
                        borderRadius="$300"
                        backgroundColor="$gray-50"
                    >
                        <HStack justifyContent="space-between" alignItems="center" marginBottom="$200">
                            <h3 className="text-sm font-semibold">프로젝트 대시보드</h3>
                            <Badge colorPalette="primary">New</Badge>
                        </HStack>
                        <Tabs.ListPrimitive backgroundColor="white" borderRadius="$200">
                            <Tabs.Button value="overview">개요</Tabs.Button>
                            <Tabs.Button value="activity">활동</Tabs.Button>
                            <Tabs.Button value="settings">설정</Tabs.Button>
                            <Tabs.IndicatorPrimitive />
                        </Tabs.ListPrimitive>
                    </Box>
                    <Tabs.Panel value="overview">
                        <Box padding="$400" marginTop="$400" border="1px solid" borderColor="$gray-200" borderRadius="$300">
                            List를 커스텀 컨테이너로 감싸야 할 때 Primitive를 사용합니다.
                        </Box>
                    </Tabs.Panel>
                    <Tabs.Panel value="activity">
                        <Box padding="$400" marginTop="$400" border="1px solid" borderColor="$gray-200" borderRadius="$300">
                            활동 내역
                        </Box>
                    </Tabs.Panel>
                    <Tabs.Panel value="settings">
                        <Box padding="$400" marginTop="$400" border="1px solid" borderColor="$gray-200" borderRadius="$300">
                            설정
                        </Box>
                    </Tabs.Panel>
                </Tabs.Root>
            </VStack>

            <VStack gap="$200">
                <h4 className="text-sm font-medium">여러 Indicator 배치</h4>
                <Tabs.Root defaultValue="home">
                    <Tabs.ListPrimitive>
                        <Tabs.Button value="home">홈</Tabs.Button>
                        <Tabs.Button value="about">소개</Tabs.Button>
                        <Tabs.Button value="contact">연락</Tabs.Button>
                        <Tabs.IndicatorPrimitive style={{ bottom: 0, height: '2px', backgroundColor: '#3b82f6' }} />
                        <Tabs.IndicatorPrimitive style={{ top: 0, height: '2px', backgroundColor: '#ef4444' }} />
                    </Tabs.ListPrimitive>
                    <Tabs.Panel value="home">
                        <Box padding="$400" marginTop="$400" border="1px solid" borderColor="$gray-200" borderRadius="$300">
                            상하단에 이중 Indicator를 배치할 수 있습니다.
                        </Box>
                    </Tabs.Panel>
                    <Tabs.Panel value="about">
                        <Box padding="$400" marginTop="$400" border="1px solid" borderColor="$gray-200" borderRadius="$300">
                            소개
                        </Box>
                    </Tabs.Panel>
                    <Tabs.Panel value="contact">
                        <Box padding="$400" marginTop="$400" border="1px solid" borderColor="$gray-200" borderRadius="$300">
                            연락처
                        </Box>
                    </Tabs.Panel>
                </Tabs.Root>
            </VStack>

            <VStack gap="$200">
                <h4 className="text-sm font-medium">Indicator 사이에 다른 요소 배치</h4>
                <Tabs.Root defaultValue="tab1">
                    <Tabs.ListPrimitive>
                        <Tabs.Button value="tab1">탭 1</Tabs.Button>
                        <Tabs.Button value="tab2">탭 2</Tabs.Button>
                        <Box flex="1" />
                        <Tabs.Button value="tab3">탭 3</Tabs.Button>
                        <Tabs.IndicatorPrimitive />
                    </Tabs.ListPrimitive>
                    <Tabs.Panel value="tab1">
                        <Box padding="$400" marginTop="$400" border="1px solid" borderColor="$gray-200" borderRadius="$300">
                            Indicator 앞에 spacer나 다른 요소를 자유롭게 배치할 수 있습니다.
                        </Box>
                    </Tabs.Panel>
                    <Tabs.Panel value="tab2">
                        <Box padding="$400" marginTop="$400" border="1px solid" borderColor="$gray-200" borderRadius="$300">
                            탭 2
                        </Box>
                    </Tabs.Panel>
                    <Tabs.Panel value="tab3">
                        <Box padding="$400" marginTop="$400" border="1px solid" borderColor="$gray-200" borderRadius="$300">
                            탭 3
                        </Box>
                    </Tabs.Panel>
                </Tabs.Root>
            </VStack>
        </VStack>
    );
}
