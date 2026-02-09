import { Breadcrumb, Text, VStack } from '@vapor-ui/core';

export default function BreadcrumbCurrent() {
    return (
        <VStack $styles={{ gap: '$200' }}>
            <VStack $styles={{ gap: '$100' }}>
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
            <VStack $styles={{ gap: '$100' }}>
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
