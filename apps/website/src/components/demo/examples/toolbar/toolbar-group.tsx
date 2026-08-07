import { Toolbar } from '@vapor-ui/core';

export default function ToolbarGroup() {
    return (
        <Toolbar.Root aria-label="문서 액션">
            <Toolbar.Group>
                <Toolbar.Button>실행 취소</Toolbar.Button>
                <Toolbar.Button>다시 실행</Toolbar.Button>
            </Toolbar.Group>
            <Toolbar.Separator />
            <Toolbar.Group disabled>
                <Toolbar.Button>잘라내기</Toolbar.Button>
                <Toolbar.Button>복사</Toolbar.Button>
                <Toolbar.Button>붙여넣기</Toolbar.Button>
            </Toolbar.Group>
        </Toolbar.Root>
    );
}
