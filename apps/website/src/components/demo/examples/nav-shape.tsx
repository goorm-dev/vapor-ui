import { Nav } from '@vapor-ui/core';

export default function NavShape() {
    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-sm font-medium mb-2">Fill Shape</h4>
                <Nav.Root shape="fill" aria-label="Fill navigation">
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
                        <Nav.Item>
                            <Nav.Link href="#">회사소개</Nav.Link>
                        </Nav.Item>
                    </Nav.List>
                </Nav.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Ghost Shape</h4>
                <Nav.Root shape="ghost" aria-label="Ghost navigation">
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
                        <Nav.Item>
                            <Nav.Link href="#">회사소개</Nav.Link>
                        </Nav.Item>
                    </Nav.List>
                </Nav.Root>
            </div>
        </div>
    );
}
