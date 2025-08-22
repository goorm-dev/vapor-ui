import { Nav } from '@vapor-ui/core';

export default function NavDirection() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-2">Horizontal</h4>
                <Nav.Root direction="horizontal" aria-label="Horizontal navigation">
                    <Nav.List>
                        <Nav.Item>
                            <Nav.Link href="#">Home</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#" selected>
                                About
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#">Contact</Nav.Link>
                        </Nav.Item>
                    </Nav.List>
                </Nav.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Vertical</h4>
                <Nav.Root direction="vertical" aria-label="Vertical navigation">
                    <Nav.List>
                        <Nav.Item>
                            <Nav.Link href="#">Home</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#" selected>
                                About
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#">Contact</Nav.Link>
                        </Nav.Item>
                    </Nav.List>
                </Nav.Root>
            </div>
        </div>
    );
}
