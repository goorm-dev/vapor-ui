import { Select, VStack } from '@vapor-ui/core';

export default function SelectGrouping() {
    return (
        <VStack width="400px">
            <Select.Root placeholder="개발 도구 선택">
                <Select.Trigger />

                <Select.Popup>
                    <Select.Group>
                        <Select.GroupLabel>프론트엔드</Select.GroupLabel>
                        <Select.Item value="react">React</Select.Item>
                        <Select.Item value="vue">Vue</Select.Item>
                        <Select.Item value="angular">Angular</Select.Item>
                    </Select.Group>

                    <Select.Separator />

                    <Select.Group>
                        <Select.GroupLabel>백엔드</Select.GroupLabel>
                        <Select.Item value="nodejs">Node.js</Select.Item>
                        <Select.Item value="python">Python</Select.Item>
                        <Select.Item value="java">Java</Select.Item>
                    </Select.Group>

                    <Select.Separator />

                    <Select.Group>
                        <Select.GroupLabel>데이터베이스</Select.GroupLabel>
                        <Select.Item value="mysql">MySQL</Select.Item>
                        <Select.Item value="postgresql">PostgreSQL</Select.Item>
                        <Select.Item value="mongodb">MongoDB</Select.Item>
                    </Select.Group>
                </Select.Popup>
            </Select.Root>
        </VStack>
    );
}
