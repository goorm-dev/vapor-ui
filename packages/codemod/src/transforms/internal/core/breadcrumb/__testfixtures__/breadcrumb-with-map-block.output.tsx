// @ts-nocheck
import { Breadcrumb } from '@vapor-ui/core';

const items = [
    { label: 'Home', href: '/' },
    { label: 'Docs', href: '/docs' },
    { label: 'Current', active: true },
];

export const Component = () => (
    <Breadcrumb.Root>
        <Breadcrumb.List>
            {items.map((item) => {
                return (
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href={item.href} current={item.active}>
                            {item.label}
                        </Breadcrumb.Link>
                    </Breadcrumb.Item>
                );
            })}
        </Breadcrumb.List>
    </Breadcrumb.Root>
);
