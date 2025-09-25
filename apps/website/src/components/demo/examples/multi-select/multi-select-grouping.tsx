import { Box, MultiSelect } from '@vapor-ui/core';

export default function MultiSelectGrouping() {
    return (
        <MultiSelect.Root placeholder="개발 기술 선택">
            <Box render={<MultiSelect.Trigger />} width="400px">
                <MultiSelect.Value />
                <MultiSelect.TriggerIcon />
            </Box>

            <MultiSelect.Content>
                <MultiSelect.Group>
                    <MultiSelect.GroupLabel>프론트엔드</MultiSelect.GroupLabel>
                    <MultiSelect.Item value="react">
                        React
                        <MultiSelect.ItemIndicator />
                    </MultiSelect.Item>
                    <MultiSelect.Item value="vue">
                        Vue
                        <MultiSelect.ItemIndicator />
                    </MultiSelect.Item>
                    <MultiSelect.Item value="angular">
                        Angular
                        <MultiSelect.ItemIndicator />
                    </MultiSelect.Item>
                    <MultiSelect.Item value="svelte">
                        Svelte
                        <MultiSelect.ItemIndicator />
                    </MultiSelect.Item>
                </MultiSelect.Group>

                <MultiSelect.Separator />

                <MultiSelect.Group>
                    <MultiSelect.GroupLabel>백엔드</MultiSelect.GroupLabel>
                    <MultiSelect.Item value="nodejs">
                        Node.js
                        <MultiSelect.ItemIndicator />
                    </MultiSelect.Item>
                    <MultiSelect.Item value="python">
                        Python
                        <MultiSelect.ItemIndicator />
                    </MultiSelect.Item>
                    <MultiSelect.Item value="java">
                        Java
                        <MultiSelect.ItemIndicator />
                    </MultiSelect.Item>
                    <MultiSelect.Item value="go">
                        Go
                        <MultiSelect.ItemIndicator />
                    </MultiSelect.Item>
                </MultiSelect.Group>

                <MultiSelect.Separator />

                <MultiSelect.Group>
                    <MultiSelect.GroupLabel>데이터베이스</MultiSelect.GroupLabel>
                    <MultiSelect.Item value="mysql">
                        MySQL
                        <MultiSelect.ItemIndicator />
                    </MultiSelect.Item>
                    <MultiSelect.Item value="postgresql">
                        PostgreSQL
                        <MultiSelect.ItemIndicator />
                    </MultiSelect.Item>
                    <MultiSelect.Item value="mongodb">
                        MongoDB
                        <MultiSelect.ItemIndicator />
                    </MultiSelect.Item>
                    <MultiSelect.Item value="redis">
                        Redis
                        <MultiSelect.ItemIndicator />
                    </MultiSelect.Item>
                </MultiSelect.Group>
            </MultiSelect.Content>
        </MultiSelect.Root>
    );
}
