import { Select } from '@vapor-ui/core';

export default function DefaultSelect() {
    return (
        <Select.Root placeholder="폰트를 선택하세요">
            <Select.Trigger width="400px" />

            <Select.Popup>
                <Select.Group>
                    <Select.GroupLabel>폰트</Select.GroupLabel>
                    <Select.Item value="sans-serif">Sans-serif</Select.Item>
                    <Select.Item value="serif">Serif</Select.Item>
                    <Select.Item value="mono">Monospace</Select.Item>
                    <Select.Item value="cursive">Cursive</Select.Item>
                </Select.Group>
            </Select.Popup>
        </Select.Root>
    );
}
