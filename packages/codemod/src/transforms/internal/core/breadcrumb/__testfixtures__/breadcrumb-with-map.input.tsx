//@ts-nocheck
import { Breadcrumb } from '@goorm-dev/vapor-core';

const HeaderBreadCrumb = ({ items }) => (
    <Breadcrumb size="sm">
        {items.map((item) => (
            <Breadcrumb.Item key={`breadcrumb_${item}`}>
                {item}
            </Breadcrumb.Item>
        ))}
    </Breadcrumb>
);
