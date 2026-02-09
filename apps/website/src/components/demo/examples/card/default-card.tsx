import { Button, Card, HStack, Text, VStack } from '@vapor-ui/core';

export default function DefaultCard() {
    return (
        <Card.Root $styles={{ width: '320px' }}>
            <Card.Header>
                <Text render={<h3 />} typography="heading5">
                    Project Settings
                </Text>
            </Card.Header>
            <Card.Body>
                <VStack $styles={{ gap: '$100' }}>
                    <Text typography="body2">Configure your project settings and preferences.</Text>
                </VStack>
            </Card.Body>
            <Card.Footer>
                <HStack $styles={{ gap: '$100', justifyContent: 'flex-end' }}>
                    <Button variant="ghost">Cancel</Button>
                    <Button>Save</Button>
                </HStack>
            </Card.Footer>
        </Card.Root>
    );
}
