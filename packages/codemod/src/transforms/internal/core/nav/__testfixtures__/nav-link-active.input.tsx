import { Nav } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Nav>
            <Nav.List>
                <Nav.Item>
                    <Nav.Link href="/" active>
                        Home
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link href="/about">About</Nav.Link>
                </Nav.Item>
            </Nav.List>
        </Nav>
    );
}
