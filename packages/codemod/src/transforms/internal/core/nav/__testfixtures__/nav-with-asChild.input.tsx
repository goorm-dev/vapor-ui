import { Nav } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Nav asChild>
            <nav>
                <Nav.List>
                    <Nav.Item asChild>
                        <li>
                            <Nav.Link href="/" asChild>
                                <a>Home</a>
                            </Nav.Link>
                        </li>
                    </Nav.Item>
                </Nav.List>
            </nav>
        </Nav>
    );
}
