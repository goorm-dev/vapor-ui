import { Breadcrumb } from '@vapor-ui/core';

const NavBreadcrumb = ({ items, activeIndex }) => (
    <Breadcrumb.Root>
        {items.map((item, index) => (
            <>
                <Breadcrumb.Item key={item.id} href={item.href} current={index === activeIndex}>
                    {item.label}
                </Breadcrumb.Item>
                {index < items.length - 1 && <Breadcrumb.Separator />}
            </>
        ))}
    </Breadcrumb.Root>
);
