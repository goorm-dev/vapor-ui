import { Nav } from '@vapor-ui/core';

export default function NavShape() {
    return (
        <div className="space-y-4">
            <Nav.Root shape="fill" aria-label="Fill navigation">
                <Nav.List>
                    <Nav.Item><Nav.Link href="#">Fill Style</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link href="#" selected>Fill Selected</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link href="#">Fill Link</Nav.Link></Nav.Item>
                </Nav.List>
            </Nav.Root>
            
            <Nav.Root shape="ghost" aria-label="Ghost navigation">
                <Nav.List>
                    <Nav.Item><Nav.Link href="#">Ghost Style</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link href="#" selected>Ghost Selected</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link href="#">Ghost Link</Nav.Link></Nav.Item>
                </Nav.List>
            </Nav.Root>
        </div>
    );
}