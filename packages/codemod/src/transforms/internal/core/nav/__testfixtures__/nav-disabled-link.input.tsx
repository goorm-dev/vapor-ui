import { Nav } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Nav>
            <Nav.List>
                <Nav.Item>
                    <Nav.Link href="/" disabled>
                        Home
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link href="/about" active disabled={false}>
                        About
                    </Nav.Link>
                </Nav.Item>
            </Nav.List>
        </Nav>
    );
}
