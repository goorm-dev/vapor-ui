import { Badge, Button, Card, Text } from '@vapor-ui/core';
import { SettingOutlineIcon } from '@vapor-ui/icons';

export default function ViteReactCard() {
    return (
        <Card.Root className="max-w-md">
            <Card.Header>
                <div className="flex items-center justify-between">
                    <Text asChild typography="heading2">
                        <h2>Vite + React</h2>
                    </Text>
                    <Badge color="primary">Modern</Badge>
                </div>
            </Card.Header>
            <Card.Body>
                <div className="space-y-4">
                    <Text>
                        Vite와 React를 사용한 빠르고 현대적인 개발 환경에서 Vapor UI 컴포넌트를
                        사용하는 예시입니다.
                    </Text>
                    <div className="flex gap-2">
                        <Button color="primary">Primary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                    </div>
                </div>
            </Card.Body>
            <Card.Footer>
                <Button color="primary" className="w-full">
                    <SettingOutlineIcon />
                    빠른 개발 경험
                </Button>
            </Card.Footer>
        </Card.Root>
    );
}
