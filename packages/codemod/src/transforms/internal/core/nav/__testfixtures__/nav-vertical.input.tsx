import { Nav } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Nav direction="vertical" stretch>
            <Nav.List>
                <Nav.Item>
                    <Nav.Link href="/">Home</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link href="/about">About</Nav.Link>
                </Nav.Item>
            </Nav.List>
        </Nav>
    );
}
