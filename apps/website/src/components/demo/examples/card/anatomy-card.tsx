import { Card, Text } from '@vapor-ui/core';

export default function AnatomyCard() {
    return (
        <Card.Root data-part="Root">
            <Card.Header data-part="Header">
                <Text typography="heading4">Card Title</Text>
            </Card.Header>
            <Card.Body data-part="Body">
                <Text typography="body2" foreground="normal-100">
                    This is the card body content area.
                </Text>
            </Card.Body>
            <Card.Footer data-part="Footer">
                <Text typography="body3" foreground="hint-100">
                    Last updated 2 hours ago
                </Text>
            </Card.Footer>
        </Card.Root>
    );
}
