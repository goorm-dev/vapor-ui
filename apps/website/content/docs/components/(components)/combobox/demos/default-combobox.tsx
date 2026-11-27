import { Combobox } from '@vapor-ui/core';

const languages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Rust', 'Go', 'Swift'];

export default function DefaultCombobox() {
    return (
        <Combobox.Root items={languages} placeholder="언어를 선택하세요" aria-label="언어">
            <Combobox.InputGroup $css={{ width: '400px' }} />

            <Combobox.Popup>
                <Combobox.Empty>검색 결과가 없습니다</Combobox.Empty>
                {(language: string) => (
                    <Combobox.Item key={language} value={language}>
                        {language}
                    </Combobox.Item>
                )}
            </Combobox.Popup>
        </Combobox.Root>
    );
}
