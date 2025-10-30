import { Nav } from '@goorm-dev/vapor-core';

export default function App() {
    const navProps = { size: 'lg', stretch: true };
    const linkProps = { href: '/', active: true };

    return (
        <Nav {...navProps}>
            <Nav.List>
                <Nav.Item>
                    <Nav.Link {...linkProps}>Home</Nav.Link>
                </Nav.Item>
            </Nav.List>
        </Nav>
    );
}
