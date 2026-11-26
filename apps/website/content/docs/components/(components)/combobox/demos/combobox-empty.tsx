import { Combobox, VStack } from '@vapor-ui/core';

const fruits = ['사과', '바나나', '포도', '딸기'];

export default function ComboboxEmpty() {
    return (
        <VStack $css={{ width: '400px' }}>
            <Combobox.Root
                items={fruits}
                defaultInputValue="없는 과일"
                placeholder="과일 검색"
                aria-label="과일"
            >
                <Combobox.InputGroup />

                <Combobox.Popup>
                    <Combobox.Empty>일치하는 과일이 없습니다</Combobox.Empty>
                    {(fruit: string) => (
                        <Combobox.Item key={fruit} value={fruit}>
                            {fruit}
                        </Combobox.Item>
                    )}
                </Combobox.Popup>
            </Combobox.Root>
        </VStack>
    );
}
