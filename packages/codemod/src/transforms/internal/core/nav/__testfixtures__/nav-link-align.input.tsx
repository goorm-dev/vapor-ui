import { Nav } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Nav>
            <Nav.List>
                <Nav.Item>
                    <Nav.Link href="/" align="center">
                        Home
                    </Nav.Link>
                </Nav.Item>
            </Nav.List>
        </Nav>
    );
}
