import { Breadcrumb, Text, VStack } from '@vapor-ui/core';

export default function BreadcrumbCurrent() {
    return (
        <VStack $css={{ gap: '$200' }}>
            <VStack $css={{ gap: '$100' }}>
                <Text typography="body3" foreground="hint-100">
                    Normal Links
                </Text>
                <Breadcrumb.Root>
                    <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#">Products</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#">Details</Breadcrumb.Item>
                </Breadcrumb.Root>
            </VStack>
            <VStack $css={{ gap: '$100' }}>
                <Text typography="body3" foreground="hint-100">
                    With Current Page
                </Text>
                <Breadcrumb.Root>
                    <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#">Products</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#" current>
                        Details
                    </Breadcrumb.Item>
                </Breadcrumb.Root>
            </VStack>
        </VStack>
    );
}
