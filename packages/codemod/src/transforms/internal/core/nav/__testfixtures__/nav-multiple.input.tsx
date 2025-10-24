import { Nav } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <>
            <Nav>
                <Nav.List>
                    <Nav.Item>
                        <Nav.Link href="/">Home</Nav.Link>
                    </Nav.Item>
                </Nav.List>
            </Nav>
            <Nav type="text">
                <Nav.List>
                    <Nav.Item>
                        <Nav.Link href="/about" active>
                            About
                        </Nav.Link>
                    </Nav.Item>
                </Nav.List>
            </Nav>
        </>
    );
}
