import { Select } from '@vapor-ui/core';

export default function SelectGrouping() {
    return (
        <Select.Root placeholder="개발 도구 선택">
            <Select.Trigger>
                <Select.Value />
                <Select.TriggerIcon />
            </Select.Trigger>

            <Select.Content>
                <Select.Group>
                    <Select.GroupLabel>프론트엔드</Select.GroupLabel>
                    <Select.Item value="react">
                        React
                        <Select.ItemIndicator />
                    </Select.Item>
                    <Select.Item value="vue">
                        Vue
                        <Select.ItemIndicator />
                    </Select.Item>
                    <Select.Item value="angular">
                        Angular
                        <Select.ItemIndicator />
                    </Select.Item>
                </Select.Group>

                <Select.Separator />

                <Select.Group>
                    <Select.GroupLabel>백엔드</Select.GroupLabel>
                    <Select.Item value="nodejs">
                        Node.js
                        <Select.ItemIndicator />
                    </Select.Item>
                    <Select.Item value="python">
                        Python
                        <Select.ItemIndicator />
                    </Select.Item>
                    <Select.Item value="java">
                        Java
                        <Select.ItemIndicator />
                    </Select.Item>
                </Select.Group>

                <Select.Separator />

                <Select.Group>
                    <Select.GroupLabel>데이터베이스</Select.GroupLabel>
                    <Select.Item value="mysql">
                        MySQL
                        <Select.ItemIndicator />
                    </Select.Item>
                    <Select.Item value="postgresql">
                        PostgreSQL
                        <Select.ItemIndicator />
                    </Select.Item>
                    <Select.Item value="mongodb">
                        MongoDB
                        <Select.ItemIndicator />
                    </Select.Item>
                </Select.Group>
            </Select.Content>
        </Select.Root>
    );
}
