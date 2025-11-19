import { Breadcrumb } from '@vapor-ui/core';

const NavBreadcrumb = ({ items }) => (
    <Breadcrumb.Root size="sm">
        {items.map((item, index) => (
            <>
                <Breadcrumb.Item key={item.id} href={item.href}>
                    {item.label}
                </Breadcrumb.Item>
                {index < items.length - 1 && <Breadcrumb.Separator />}
            </>
        ))}
    </Breadcrumb.Root>
);
