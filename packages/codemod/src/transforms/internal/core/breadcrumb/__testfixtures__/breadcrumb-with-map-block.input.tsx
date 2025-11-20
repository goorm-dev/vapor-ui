// @ts-nocheck
import { Breadcrumb } from '@goorm-dev/vapor-core';

const items = [
    { label: 'Home', href: '/' },
    { label: 'Docs', href: '/docs' },
    { label: 'Current', active: true },
];

export const Component = () => (
    <Breadcrumb>
        {items.map((item) => {
            return (
                <Breadcrumb.Item href={item.href} active={item.active}>
                    {item.label}
                </Breadcrumb.Item>
            );
        })}
    </Breadcrumb>
);
