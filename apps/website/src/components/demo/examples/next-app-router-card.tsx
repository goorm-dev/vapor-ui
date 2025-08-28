import { Button, Card, CardBody, Text } from '@vapor-ui/core';

export default function CardExample() {
    return (
        <Card.Root className="max-w-md">
            <CardBody>
                <div className="flex flex-col gap-4">
                    <Text asChild typography="heading1" foreground="normal">
                        <h1>Welcome to Vapor UI!</h1>
                    </Text>
                    <Text>
                        이것은 Next.js App Router와 함께 Vapor UI 컴포넌트를 사용하는 예시입니다.
                    </Text>
                </div>
            </CardBody>
            <Card.Footer>
                <Button color="primary">Primary</Button>
                <Button variant="ghost">Ghost</Button>
            </Card.Footer>
        </Card.Root>
    );
}
