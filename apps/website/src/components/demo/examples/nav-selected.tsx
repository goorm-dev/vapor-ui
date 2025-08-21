import { Nav } from '@vapor-ui/core';

export default function NavSelected() {
    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-sm font-medium mb-2">선택된 상태 표시</h4>
                <Nav.Root aria-label="Navigation with selected link">
                    <Nav.List>
                        <Nav.Item><Nav.Link href="#">홈</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link href="#" selected>제품 (선택됨)</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link href="#">서비스</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link href="#">회사소개</Nav.Link></Nav.Item>
                    </Nav.List>
                </Nav.Root>
            </div>
            
            <div>
                <h4 className="text-sm font-medium mb-2">다양한 모양에서의 선택 상태</h4>
                <div className="space-y-3">
                    <Nav.Root shape="fill" aria-label="Fill navigation with selection">
                        <Nav.List>
                            <Nav.Item><Nav.Link href="#">일반</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link href="#" selected>선택됨 (Fill)</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link href="#">일반</Nav.Link></Nav.Item>
                        </Nav.List>
                    </Nav.Root>
                    
                    <Nav.Root shape="ghost" aria-label="Ghost navigation with selection">
                        <Nav.List>
                            <Nav.Item><Nav.Link href="#">일반</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link href="#" selected>선택됨 (Ghost)</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link href="#">일반</Nav.Link></Nav.Item>
                        </Nav.List>
                    </Nav.Root>
                </div>
            </div>
        </div>
    );
}