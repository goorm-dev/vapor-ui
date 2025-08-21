import { Nav } from '@vapor-ui/core';

export default function NavStretch() {
    return (
        <div className="space-y-4 w-full">
            <div>
                <h4 className="text-sm font-medium mb-2">Default (stretch=false)</h4>
                <Nav.Root aria-label="Default navigation">
                    <Nav.List>
                        <Nav.Item><Nav.Link href="#">홈</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link href="#" selected>제품</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link href="#">서비스</Nav.Link></Nav.Item>
                    </Nav.List>
                </Nav.Root>
            </div>
            
            <div>
                <h4 className="text-sm font-medium mb-2">Stretch (stretch=true)</h4>
                <Nav.Root stretch aria-label="Stretched navigation">
                    <Nav.List>
                        <Nav.Item><Nav.Link href="#">홈</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link href="#" selected>제품</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link href="#">서비스</Nav.Link></Nav.Item>
                    </Nav.List>
                </Nav.Root>
            </div>
        </div>
    );
}