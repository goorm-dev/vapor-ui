//@ts-nocheck
import { Nav } from '@goorm-dev/vapor-core';

function App() {
    return (
        <Nav size="lg" stretch position="center">
            <Nav.List>
                <Nav.Item>
                    <Nav.Link href="/" active align="center">
                        Home
                    </Nav.Link>
                </Nav.Item>
            </Nav.List>
        </Nav>
    );
}
