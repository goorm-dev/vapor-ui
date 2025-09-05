import { Nav } from '@vapor-ui/core';

export default function NavDisabled() {
    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-sm font-medium mb-2">기본 상태와 비활성화 상태</h4>
                <Nav.Root aria-label="Navigation with disabled links">
                    <Nav.List>
                        <Nav.Item>
                            <Nav.Link href="#">활성 링크</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#" disabled>
                                비활성화 링크
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#">다른 활성 링크</Nav.Link>
                        </Nav.Item>
                    </Nav.List>
                </Nav.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">선택된 상태와 비활성화 상태</h4>
                <Nav.Root aria-label="Navigation with selected and disabled">
                    <Nav.List>
                        <Nav.Item>
                            <Nav.Link href="#">홈</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#" selected>
                                선택된 링크
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#" disabled>
                                비활성화 링크
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="#">연락처</Nav.Link>
                        </Nav.Item>
                    </Nav.List>
                </Nav.Root>
            </div>
        </div>
    );
}
