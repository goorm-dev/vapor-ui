import { Breadcrumb } from '@vapor-ui/core';

const NavBreadcrumb = ({ items }) => (
    <Breadcrumb.Root size="sm">
<<<<<<< HEAD
        <Breadcrumb.List>
            {items.map((item, index) => (
                <>
                </Breadcrumb.Item>
                {index < items.length - 1 && <Breadcrumb.Separator />}
            </>
        ))}
>>>>>>> e25e8cb043337cb2084a990240957bdb31b22d93
    </Breadcrumb.Root>
);
