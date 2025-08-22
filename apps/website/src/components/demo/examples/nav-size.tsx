import { Nav } from '@vapor-ui/core';

export default function NavSize() {
    return (
        <div className="space-y-4">
            <Nav.Root size="sm" aria-label="Small navigation">
                <Nav.List>
                    <Nav.Item>
                        <Nav.Link href="#">Small</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link href="#" selected>
                            Small Selected
                        </Nav.Link>
                    </Nav.Item>
                </Nav.List>
            </Nav.Root>

            <Nav.Root size="md" aria-label="Medium navigation">
                <Nav.List>
                    <Nav.Item>
                        <Nav.Link href="#">Medium</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link href="#" selected>
                            Medium Selected
                        </Nav.Link>
                    </Nav.Item>
                </Nav.List>
            </Nav.Root>

            <Nav.Root size="lg" aria-label="Large navigation">
                <Nav.List>
                    <Nav.Item>
                        <Nav.Link href="#">Large</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link href="#" selected>
                            Large Selected
                        </Nav.Link>
                    </Nav.Item>
                </Nav.List>
            </Nav.Root>

            <Nav.Root size="xl" aria-label="Extra large navigation">
                <Nav.List>
                    <Nav.Item>
                        <Nav.Link href="#">Extra Large</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link href="#" selected>
                            Extra Large Selected
                        </Nav.Link>
                    </Nav.Item>
                </Nav.List>
            </Nav.Root>
        </div>
    );
}
