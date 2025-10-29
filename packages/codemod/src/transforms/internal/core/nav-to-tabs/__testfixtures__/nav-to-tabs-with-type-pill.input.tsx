//@ts-nocheck
import { Nav } from '@goorm-dev/vapor-core';

function App() {
    return (
        <Nav type="pill" size="md" direction="horizontal">
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
