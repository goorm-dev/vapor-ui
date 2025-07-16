import { Nav } from '@vapor-ui/core';

export default function DefaultNav() {
    return (
        <Nav.Root size="md" shape="fill" aria-label="Navigation menu">
            <Nav.List>
                <Nav.Item>
                    <Nav.Link href="#">Default Link</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link href="#" selected>
                        Selected Link
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link href="#" disabled>
                        Disabled Link
                    </Nav.Link>
                </Nav.Item>
            </Nav.List>
        </Nav.Root>
    );
}
