import { Box, Text, VStack } from '@vapor-ui/core';

import { groupByImage } from '~/utils/linear/group-by-image';

import { ItemCard } from './ItemCard';
import { RegisterBar } from './RegisterBar';
import { useQaItems } from './useQaItems';
import { useStoredApiKey } from './useStoredApiKey';

const App = () => {
    const apiKey = useStoredApiKey();
    const items = useQaItems();

    return (
        <Box style={{ padding: 16 }}>
            <VStack $css={{ gap: '$200' }}>
                <Text typography="heading6">QA 항목 검토 ({items.length})</Text>

                {items.length === 0 ? (
                    <Text typography="body2" foreground="hint-100">
                        아직 수집된 항목이 없습니다.
                    </Text>
                ) : (
                    <>
                        {apiKey ? (
                            <RegisterBar apiKey={apiKey} items={items} />
                        ) : (
                            <Text typography="body2" foreground="hint-100">
                                확장 아이콘을 눌러 Linear API 키를 먼저 입력하세요.
                            </Text>
                        )}
                        {groupByImage(items).map((group) => (
                            <ItemCard key={group[0].id} group={group} />
                        ))}
                    </>
                )}
            </VStack>
        </Box>
    );
};

export default App;
