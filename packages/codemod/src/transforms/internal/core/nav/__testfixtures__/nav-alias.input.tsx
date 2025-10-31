// @ts-nocheck
import { Nav as MyNav } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <MyNav type="horizontal">
            <MyNav.List>
                <MyNav.Item>
                    <MyNav.Link href="/" active align="center">
                        Home
                    </MyNav.Link>
                </MyNav.Item>
                <MyNav.Item>
                    <MyNav.Link href="/about">About</MyNav.Link>
                </MyNav.Item>
            </MyNav.List>
        </MyNav>
    );
}
