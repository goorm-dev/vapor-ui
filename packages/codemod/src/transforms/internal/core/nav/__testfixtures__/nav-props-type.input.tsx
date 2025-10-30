import { Nav } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Nav size="md" type="pill" stretch={false} direction="horizontal">
            <Nav.List>
                <Nav.Item>
                    <Nav.Link href="/">Home</Nav.Link>
                </Nav.Item>
            </Nav.List>
        </Nav>
    );
}
