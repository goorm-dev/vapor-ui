//@ts-nocheck
import { Breadcrumb } from '@vapor-ui/core';

const HeaderBreadCrumb = ({ items }) => (
    <Breadcrumb.Root size="sm">
        <Breadcrumb.List>
            {items.map((item, index) => (
                <>
                    <Breadcrumb.Item key={`breadcrumb_${item}`}>{item}</Breadcrumb.Item>
                    {index < items.length - 1 && <Breadcrumb.Separator />}
                </>
            ))}
        </Breadcrumb.List>
    </Breadcrumb.Root>
);
