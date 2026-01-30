import { Breadcrumb, Text, VStack } from '@vapor-ui/core';
import { ChevronRightOutlineIcon, HomeIcon } from '@vapor-ui/icons';

export default function BreadcrumbComposition() {
    return (
        <VStack gap="$300">
            <VStack gap="$100">
                <Text typography="body3" foreground="hint-100">
                    Basic
                </Text>
                <Breadcrumb.Root>
                    <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#">Products</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item current>Details</Breadcrumb.Item>
                </Breadcrumb.Root>
            </VStack>
            <VStack gap="$100">
                <Text typography="body3" foreground="hint-100">
                    Custom Separator
                </Text>
                <Breadcrumb.Root>
                    <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                    <Breadcrumb.Separator>
                        <ChevronRightOutlineIcon />
                    </Breadcrumb.Separator>
                    <Breadcrumb.Item href="#">Products</Breadcrumb.Item>
                    <Breadcrumb.Separator>
                        <ChevronRightOutlineIcon />
                    </Breadcrumb.Separator>
                    <Breadcrumb.Item current>Details</Breadcrumb.Item>
                </Breadcrumb.Root>
            </VStack>
            <VStack gap="$100">
                <Text typography="body3" foreground="hint-100">
                    With Icon
                </Text>
                <Breadcrumb.Root>
                    <Breadcrumb.Item href="#" className="flex items-center gap-1">
                        <HomeIcon className="size-4" />
                        Home
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#">Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item current>Settings</Breadcrumb.Item>
                </Breadcrumb.Root>
            </VStack>
        </VStack>
    );
}
