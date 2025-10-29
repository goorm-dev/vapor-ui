//@ts-nocheck
import { Nav } from '@goorm-dev/vapor-core';
import { Button } from '@vapor-ui/core';

function App() {
    return (
        <>
            <Button>Click</Button>
            <Nav type="pill">
                <Nav.List>
                    <Nav.Item>
                        <Nav.Link href="/">Home</Nav.Link>
                    </Nav.Item>
                </Nav.List>
            </Nav>
        </>
    );
}
