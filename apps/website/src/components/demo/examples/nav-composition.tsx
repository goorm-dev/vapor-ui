import { Nav } from '@vapor-ui/core';

export default function NavComposition() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-2">기본 컴포지션 패턴</h4>
                <Nav.Root aria-label="Basic composition navigation">
                    <Nav.List>
                        <Nav.Item>
                            <Nav.Link href="/">홈</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="/products" selected>제품</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="/about">회사소개</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="/contact">연락처</Nav.Link>
                        </Nav.Item>
                    </Nav.List>
                </Nav.Root>
            </div>
            
            <div>
                <h4 className="text-sm font-medium mb-2">LinkItem 패턴 (편의 컴포넌트)</h4>
                <Nav.Root aria-label="LinkItem pattern navigation">
                    <Nav.List>
                        <Nav.LinkItem href="/">홈</Nav.LinkItem>
                        <Nav.LinkItem href="/products">제품</Nav.LinkItem>
                        <Nav.LinkItem href="/about">회사소개</Nav.LinkItem>
                        <Nav.LinkItem href="/contact">연락처</Nav.LinkItem>
                    </Nav.List>
                </Nav.Root>
            </div>
        </div>
    );
}