import { Nav } from '@goorm-dev/vapor-core';
import { Button } from '@vapor-ui/core';

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
            <Button>Click me</Button>
        </>
    );
}
