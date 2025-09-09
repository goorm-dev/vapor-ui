import { Nav } from '@vapor-ui/core';

export default function NavAlign() {
    return (
        <div className="space-y-4 w-full">
            <div>
                <h4 className="text-sm font-medium mb-2">Start 정렬</h4>
                <Nav.Root stretch align="start" aria-label="Start aligned navigation">
                    <Nav.List>
                        <Nav.Item>
                            <Nav.Link href="#">홈</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#" selected>
                                제품
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#">서비스</Nav.Link>
                        </Nav.Item>
                    </Nav.List>
                </Nav.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Center 정렬</h4>
                <Nav.Root stretch align="center" aria-label="Center aligned navigation">
                    <Nav.List>
                        <Nav.Item>
                            <Nav.Link href="#">홈</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#" selected>
                                제품
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#">서비스</Nav.Link>
                        </Nav.Item>
                    </Nav.List>
                </Nav.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">End 정렬</h4>
                <Nav.Root stretch align="end" aria-label="End aligned navigation">
                    <Nav.List>
                        <Nav.Item>
                            <Nav.Link href="#">홈</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#" selected>
                                제품
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#">서비스</Nav.Link>
                        </Nav.Item>
                    </Nav.List>
                </Nav.Root>
            </div>
        </div>
    );
}
