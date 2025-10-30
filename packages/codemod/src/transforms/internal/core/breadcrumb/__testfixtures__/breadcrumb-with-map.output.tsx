//@ts-nocheck
import { Breadcrumb } from '@vapor-ui/core';

const HeaderBreadCrumb = ({ items }) => (
    <Breadcrumb.Root size="sm">
        <Breadcrumb.List>
            {items.map((item) => (
                <Breadcrumb.Item key={`breadcrumb_${item}`}>{item}</Breadcrumb.Item>
            ))}
        </Breadcrumb.List>
    </Breadcrumb.Root>
);
