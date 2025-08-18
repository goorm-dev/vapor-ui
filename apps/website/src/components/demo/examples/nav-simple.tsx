import { Nav } from '@vapor-ui/core';

export default function NavSimple() {
    return (
        <Nav.Root size="md" shape="fill" aria-label="Simple navigation">
            <Nav.List>
                <Nav.LinkItem href="/">홈</Nav.LinkItem>
                <Nav.LinkItem href="/products" selected>제품</Nav.LinkItem>
                <Nav.LinkItem href="/about">회사소개</Nav.LinkItem>
                <Nav.LinkItem href="/contact" disabled>연락처</Nav.LinkItem>
            </Nav.List>
        </Nav.Root>
    );
}