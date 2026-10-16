import { Breadcrumb, HStack, Text, VStack } from '@vapor-ui/core';

export default function BreadcrumbSize() {
    return (
        <VStack $css={{ gap: '$200' }}>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    sm
                </Text>
                <Breadcrumb.Root size="sm">
                    <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#">Products</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#" current>
                        Details
                    </Breadcrumb.Item>
                </Breadcrumb.Root>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    md
                </Text>
                <Breadcrumb.Root size="md">
                    <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#">Products</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#" current>
                        Details
                    </Breadcrumb.Item>
                </Breadcrumb.Root>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <Breadcrumb.Root size="lg">
                    <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#">Products</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#" current>
                        Details
                    </Breadcrumb.Item>
                </Breadcrumb.Root>
            </HStack>
            <HStack $css={{ gap: '$150', alignItems: 'center' }}>
                <Text className="w-6" typography="body3" foreground="hint-100">
                    xl
                </Text>
                <Breadcrumb.Root size="xl">
                    <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#">Products</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#" current>
                        Details
                    </Breadcrumb.Item>
                </Breadcrumb.Root>
            </HStack>
        </VStack>
    );
}
