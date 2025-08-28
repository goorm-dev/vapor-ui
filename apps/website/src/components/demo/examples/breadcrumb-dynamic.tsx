import { Fragment } from 'react';

import { Breadcrumb } from '@vapor-ui/core';

export default function BreadcrumbDynamic() {
    const paths = [
        { name: 'Home', href: '/' },
        { name: 'Documentation', href: '/docs' },
        { name: 'Components', href: '/docs/components' },
        { name: 'Breadcrumb', href: '/docs/components/breadcrumb' },
    ];

    return (
        <Breadcrumb.Root size="md">
            <Breadcrumb.List>
                {paths.map((path, index) => (
                    <Fragment key={path.href}>
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href={path.href} current={index === paths.length - 1}>
                                {path.name}
                            </Breadcrumb.Link>
                        </Breadcrumb.Item>
                        {index < paths.length - 1 && <Breadcrumb.Separator />}
                    </Fragment>
                ))}
            </Breadcrumb.List>
        </Breadcrumb.Root>
    );
}
