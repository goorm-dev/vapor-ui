import { Nav } from '@vapor-ui/core';

export default function NavVariants() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-2">Stretch 변형</h4>
                <Nav.Root stretch aria-label="Stretched navigation">
                    <Nav.List>
                        <Nav.Item><Nav.Link href="#">홈</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link href="#" selected>제품</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link href="#">서비스</Nav.Link></Nav.Item>
                    </Nav.List>
                </Nav.Root>
            </div>
            
            <div>
                <h4 className="text-sm font-medium mb-2">정렬 변형</h4>
                <div className="space-y-3">
                    <Nav.Root align="start" aria-label="Start aligned navigation">
                        <Nav.List>
                            <Nav.Item><Nav.Link href="#">시작 정렬</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link href="#" selected>선택됨</Nav.Link></Nav.Item>
                        </Nav.List>
                    </Nav.Root>
                    
                    <Nav.Root align="center" aria-label="Center aligned navigation">
                        <Nav.List>
                            <Nav.Item><Nav.Link href="#">중앙 정렬</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link href="#" selected>선택됨</Nav.Link></Nav.Item>
                        </Nav.List>
                    </Nav.Root>
                    
                    <Nav.Root align="end" aria-label="End aligned navigation">
                        <Nav.List>
                            <Nav.Item><Nav.Link href="#">끝 정렬</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link href="#" selected>선택됨</Nav.Link></Nav.Item>
                        </Nav.List>
                    </Nav.Root>
                </div>
            </div>
        </div>
    );
}