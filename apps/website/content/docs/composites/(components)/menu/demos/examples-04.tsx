import { Menu } from '@vapor-ui/composites';
import { Button, Text } from '@vapor-ui/core';

export default function Demo() {
    return (
        <Menu.Root trigger={<Button>Open menu</Button>}>
            <Menu.Root
                trigger={
                    <Menu.SubmenuItem
                        label="유형"
                        trailing={
                            <Text foreground="hint" typography="body3">
                                전체
                            </Text>
                        }
                    />
                }
            >
                ...
            </Menu.Root>
            <Menu.Root
                trigger={
                    <Menu.SubmenuItem
                        label="상태"
                        trailing={
                            <Text foreground="hint" typography="body3">
                                진행 중
                            </Text>
                        }
                    />
                }
            >
                <Menu.CheckGroup mode="single" label="Label">
                    <Menu.CheckItem
                        value="1" // TODO: 아이템을 특정하는 ID를 추가하세요.
                        label="진행 중"
                    />
                    <Menu.CheckItem
                        value="2" // TODO: 아이템을 특정하는 ID를 추가하세요.
                        label="검토 중"
                    />
                    <Menu.CheckItem
                        value="3" // TODO: 아이템을 특정하는 ID를 추가하세요.
                        label="완료"
                    />
                </Menu.CheckGroup>
            </Menu.Root>
            <Menu.Item label="세부 설정" onClick={() => {}} />
        </Menu.Root>
    );
}
