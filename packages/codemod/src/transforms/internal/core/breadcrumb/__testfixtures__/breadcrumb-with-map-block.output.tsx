import { Breadcrumb } from '@vapor-ui/core';

const items = [
    { label: 'Home', href: '/' },
    { label: 'Docs', href: '/docs' },
    { label: 'Current', active: true },
];

export const Component = () => (
    <Breadcrumb.Root>
        {items.map((item) => {
            return (
                <Breadcrumb.Item href={item.href} current={item.active}>
                    {item.label}
                </Breadcrumb.Item>
            );
        })}
    </Breadcrumb.Root>
);
