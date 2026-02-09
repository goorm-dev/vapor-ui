import { Card, HStack, Text, VStack } from '@vapor-ui/core';

export default function CardLayout() {
    return (
        <VStack $styles={{ gap: '$200' }}>
            <VStack $styles={{ gap: '$050' }}>
                <Text typography="body3" foreground="hint-100">
                    Body only
                </Text>
                <Card.Root $styles={{ width: '280px' }}>
                    <Card.Body>
                        <Text typography="body2">A simple card with content only.</Text>
                    </Card.Body>
                </Card.Root>
            </VStack>

            <VStack $styles={{ gap: '$050' }}>
                <Text typography="body3" foreground="hint-100">
                    Body + Footer
                </Text>
                <Card.Root $styles={{ width: '280px' }}>
                    <Card.Body>
                        <Text typography="body2">Card content goes here.</Text>
                    </Card.Body>
                    <Card.Footer>
                        <HStack $styles={{ justifyContent: 'flex-end' }}>
                            <Text typography="body3" foreground="hint-100">
                                Updated 2 hours ago
                            </Text>
                        </HStack>
                    </Card.Footer>
                </Card.Root>
            </VStack>

            <VStack $styles={{ gap: '$050' }}>
                <Text typography="body3" foreground="hint-100">
                    Header + Body
                </Text>
                <Card.Root $styles={{ width: '280px' }}>
                    <Card.Header>
                        <Text render={<h4 />} typography="heading6">
                            Notifications
                        </Text>
                    </Card.Header>
                    <Card.Body>
                        <Text typography="body2">You have 3 unread messages.</Text>
                    </Card.Body>
                </Card.Root>
            </VStack>
        </VStack>
    );
}
