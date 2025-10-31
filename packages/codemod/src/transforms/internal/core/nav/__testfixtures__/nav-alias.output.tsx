// @ts-nocheck
import { NavigationMenu as MyNav } from '@vapor-ui/core';

export default function App() {
    return (
        <MyNav.Root aria-label="Navigation">
            <MyNav.List>
                <MyNav.Item>
                    {/* TODO: The "align" prop has been removed. Please use CSS (text-align or flexbox) to customize alignment. */}
                    <MyNav.Link href="/" selected>
                        Home
                    </MyNav.Link>
                </MyNav.Item>
                <MyNav.Item>
                    <MyNav.Link href="/about">About</MyNav.Link>
                </MyNav.Item>
            </MyNav.List>
        </MyNav.Root>
    );
}
