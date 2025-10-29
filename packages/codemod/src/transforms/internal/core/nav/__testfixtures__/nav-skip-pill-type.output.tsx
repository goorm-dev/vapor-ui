// @ts-nocheck
import { Nav } from '@goorm-dev/vapor-core';

function App() {
    return (
        <Nav type="pill">
            <Nav.List>
                <Nav.Item>
                    <Nav.Link href="/">Home</Nav.Link>
                </Nav.Item>
            </Nav.List>
        </Nav>
    );
}
