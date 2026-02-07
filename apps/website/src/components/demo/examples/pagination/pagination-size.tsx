import { HStack, Pagination, Text, VStack } from '@vapor-ui/core';

export default function PaginationSize() {
    return (
        <VStack gap="$150">
            <HStack gap="$150" alignItems="center">
                <Text className="w-6" typography="body3" foreground="hint-100">
                    sm
                </Text>
                <Pagination.Root totalPages={5} size="sm">
                    <Pagination.Previous />
                    <Pagination.Items />
                    <Pagination.Next />
                </Pagination.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-6" typography="body3" foreground="hint-100">
                    md
                </Text>
                <Pagination.Root totalPages={5} size="md">
                    <Pagination.Previous />
                    <Pagination.Items />
                    <Pagination.Next />
                </Pagination.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-6" typography="body3" foreground="hint-100">
                    lg
                </Text>
                <Pagination.Root totalPages={5} size="lg">
                    <Pagination.Previous />
                    <Pagination.Items />
                    <Pagination.Next />
                </Pagination.Root>
            </HStack>
            <HStack gap="$150" alignItems="center">
                <Text className="w-6" typography="body3" foreground="hint-100">
                    xl
                </Text>
                <Pagination.Root totalPages={5} size="xl">
                    <Pagination.Previous />
                    <Pagination.Items />
                    <Pagination.Next />
                </Pagination.Root>
            </HStack>
        </VStack>
    );
}
