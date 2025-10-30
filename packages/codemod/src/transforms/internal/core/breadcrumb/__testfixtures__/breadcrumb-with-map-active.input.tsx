//@ts-nocheck
import { Breadcrumb } from '@goorm-dev/vapor-core';

const NavBreadcrumb = ({ items, activeIndex }) => (
    <Breadcrumb>
        {items.map((item, index) => (
            <Breadcrumb.Item key={item.id} href={item.href} active={index === activeIndex}>
                {item.label}
            </Breadcrumb.Item>
        ))}
    </Breadcrumb>
);
