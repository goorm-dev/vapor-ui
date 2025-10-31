//@ts-nocheck
import { Breadcrumb } from '@vapor-ui/core';

const NavBreadcrumb = ({ items, activeIndex }) => (
    <Breadcrumb.Root>
        <Breadcrumb.List>
            {items.map((item, index) => (
                <>
                    <Breadcrumb.Item key={item.id}>
                        <Breadcrumb.Link href={item.href} current={index === activeIndex}>
                            {item.label}
                        </Breadcrumb.Link>
                    </Breadcrumb.Item>
                    {index < items.length - 1 && <Breadcrumb.Separator />}
                </>
            ))}
        </Breadcrumb.List>
    </Breadcrumb.Root>
);
