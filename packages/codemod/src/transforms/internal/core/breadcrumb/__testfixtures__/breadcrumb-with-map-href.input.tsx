//@ts-nocheck
import { Breadcrumb } from '@goorm-dev/vapor-core';

const NavBreadcrumb = ({ items }) => (
    <Breadcrumb size="sm">
        {items.map((item) => (
            <Breadcrumb.Item key={item.id} href={item.href}>
                {item.label}
            </Breadcrumb.Item>
        ))}
    </Breadcrumb>
);
