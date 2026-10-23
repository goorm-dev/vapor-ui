import { Menu } from '@vapor-ui/composites';
import { Button, Text } from '@vapor-ui/core';

export default function Demo() {
    return (
        <Menu.Root trigger={<Button>Open menu</Button>}>
            <Menu.CheckGroup mode="single" label="언어 선택">
                <Menu.CheckItem
                    value="ko" // TODO: 아이템을 특정하는 ID를 추가하세요.
                    label="한국어"
                    trailing={
                        <Text foreground="hint" typography="body3">
                            한국어
                        </Text>
                    }
                />
                <Menu.CheckItem
                    value="en" // TODO: 아이템을 특정하는 ID를 추가하세요.
                    label="English"
                    trailing={
                        <Text foreground="hint" typography="body3">
                            영어
                        </Text>
                    }
                />
                <Menu.CheckItem
                    value="jp" // TODO: 아이템을 특정하는 ID를 추가하세요.
                    label="日本語"
                    trailing={
                        <Text foreground="hint" typography="body3">
                            일본어
                        </Text>
                    }
                />
            </Menu.CheckGroup>

            <Menu.CheckGroup mode="multiple" label="번역 옵션 선택">
                <Menu.CheckItem
                    value="translate" // TODO: 아이템을 특정하는 ID를 추가하세요.
                    label="자동 번역"
                />
                <Menu.CheckItem
                    value="original text" // TODO: 아이템을 특정하는 ID를 추가하세요.
                    label="원문 함께 보기"
                />
                <Menu.CheckItem
                    value="noun" // TODO: 아이템을 특정하는 ID를 추가하세요.
                    label="고유명사 원문 표시"
                />
            </Menu.CheckGroup>
        </Menu.Root>
    );
}
