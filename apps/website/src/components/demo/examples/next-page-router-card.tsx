import { Badge, Button, Card, Text } from '@vapor-ui/core';

export default function NextPageRouterCard() {
    return (
        <Card.Root className="max-w-md">
            <Card.Header>
                <div className="flex items-center justify-between">
                    <Text asChild typography="heading2">
                        <h2>Pages Router</h2>
                    </Text>
                    <Badge color="primary">pages</Badge>
                </div>
            </Card.Header>
            <Card.Body>
                <div className="space-y-4">
                    <Text>
                        Next.js Pages Router와 함께 Vapor UI 컴포넌트를 사용하는 예시입니다.
                    </Text>
                </div>
            </Card.Body>
            <Card.Footer>
                <div className="flex gap-2">
                    <Button color="primary">Primary</Button>
                    <Button variant="outline">Outline</Button>
                </div>
            </Card.Footer>
        </Card.Root>
    );
}
