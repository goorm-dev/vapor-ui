import React from 'react';

import { Text } from '@vapor-ui/core';

const DocsTitle = ({ children }: { children: React.ReactNode }) => {
    return (
        <Text typography="heading1" foreground="contrast" render={<h1 />}>
            {children}
        </Text>
    );
};

export default DocsTitle;
