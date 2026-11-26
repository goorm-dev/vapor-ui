import { Combobox, Field, VStack } from '@vapor-ui/core';

const fonts = ['Sans-serif', 'Serif', 'Monospace', 'Cursive'];

export default function ComboboxWithField() {
    return (
        <Field.Root name="font" className="w-96">
            <Combobox.Root items={fonts} placeholder="폰트를 선택하세요">
                <VStack render={<Field.Label />} $css={{ gap: '$050' }}>
                    폰트
                    <Combobox.InputGroup />
                </VStack>

                <Combobox.Popup>
                    <Combobox.Empty>검색 결과가 없습니다</Combobox.Empty>
                    {(font: string) => (
                        <Combobox.Item key={font} value={font}>
                            {font}
                        </Combobox.Item>
                    )}
                </Combobox.Popup>
            </Combobox.Root>
            <Field.Description>문서에 사용할 폰트를 고릅니다.</Field.Description>
        </Field.Root>
    );
}
