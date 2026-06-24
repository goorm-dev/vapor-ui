import { Box, Text, VStack } from '@vapor-ui/core';

import { ItemCard } from './ItemCard';
import { useQaItems } from './useQaItems';

const App = () => {
    const items = useQaItems();

    return (
        <Box style={{ padding: 16 }}>
            <VStack gap="$200">
                <Text typography="heading6">QA 항목 검토 ({items.length})</Text>

                {items.length === 0 ? (
                    <Text typography="body2" foreground="hint-100">
                        아직 수집된 항목이 없습니다.
                    </Text>
                ) : (
                    items.map((item) => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            siblings={items.filter((other) => other.imageRef === item.imageRef)}
                        />
                    ))
                )}
            </VStack>
        </Box>
    );
};

export default App;
