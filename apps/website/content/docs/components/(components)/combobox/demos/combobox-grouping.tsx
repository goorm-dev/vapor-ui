import { Combobox, VStack } from '@vapor-ui/core';

const groups = [
    { label: '프론트엔드', items: ['React', 'Vue', 'Angular'] },
    { label: '백엔드', items: ['Node.js', 'Python', 'Java'] },
    { label: '데이터베이스', items: ['MySQL', 'PostgreSQL', 'MongoDB'] },
];

export default function ComboboxGrouping() {
    return (
        <VStack $css={{ width: '400px' }}>
            <Combobox.Root placeholder="개발 도구 선택" aria-label="개발 도구">
                <Combobox.InputGroup />

                <Combobox.Popup>
                    {groups.map((group, index) => (
                        <div key={group.label}>
                            {index > 0 && <Combobox.Separator />}
                            <Combobox.Group>
                                <Combobox.GroupLabel>{group.label}</Combobox.GroupLabel>
                                {group.items.map((item) => (
                                    <Combobox.Item key={item} value={item}>
                                        {item}
                                    </Combobox.Item>
                                ))}
                            </Combobox.Group>
                        </div>
                    ))}
                </Combobox.Popup>
            </Combobox.Root>
        </VStack>
    );
}
