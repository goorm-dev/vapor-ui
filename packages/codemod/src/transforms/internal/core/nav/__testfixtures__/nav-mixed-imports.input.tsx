import { Nav, Badge, Button } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <>
            <Badge>New</Badge>
            <Nav>
                <Nav.List>
                    <Nav.Item>
                        <Nav.Link href="/">Home</Nav.Link>
                    </Nav.Item>
                </Nav.List>
            </Nav>
            <Button>Click me</Button>
        </>
    );
}
