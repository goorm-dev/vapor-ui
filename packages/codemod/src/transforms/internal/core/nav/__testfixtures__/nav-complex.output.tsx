import { Nav } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Nav size="md" type="pill" direction="horizontal" className="custom-nav">
            <Nav.List>
                <Nav.Item>
                    <Nav.Link href="/" active align="center">
                        Home
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link href="/products" disabled>
                        Products
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link href="/about" align="left">
                        About
                    </Nav.Link>
                </Nav.Item>
            </Nav.List>
        </Nav>
    );
}
