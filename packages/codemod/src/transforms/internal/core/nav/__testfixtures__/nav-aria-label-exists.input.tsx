import { Nav } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Nav aria-label="Main navigation">
            <Nav.List>
                <Nav.Item>
                    <Nav.Link href="/">Home</Nav.Link>
                </Nav.Item>
            </Nav.List>
        </Nav>
    );
}
