import { Menu } from '@vapor-ui/composites';
import { Button } from '@vapor-ui/core';

export default function Demo() {
    return (
        <Menu.Root trigger={<Button>Open menu</Button>}>
            <Menu.Item label="복사" onClick={() => {}} />
            <Menu.Item label="붙여넣기" onClick={() => {}} />
            <Menu.Item label="실행 취소" onClick={() => {}} />
            <Menu.Item label="삭제" variant="critical" onClick={() => {}} />
        </Menu.Root>
    );
}
