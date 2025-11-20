import { HStack } from '@vapor-ui/core';

export default function HStackSpacing() {
    return (
        <div className="flex flex-wrap gap-2">
            <div>
                <h4 className="text-sm font-medium mb-2">Gap 100</h4>
                <HStack gap="$100">
                    <div className="bg-red-100 p-2 rounded text-sm">A</div>
                    <div className="bg-red-100 p-2 rounded text-sm">B</div>
                    <div className="bg-red-100 p-2 rounded text-sm">C</div>
                </HStack>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Gap 400</h4>
                <HStack gap="$400">
                    <div className="bg-orange-100 p-2 rounded text-sm">A</div>
                    <div className="bg-orange-100 p-2 rounded text-sm">B</div>
                    <div className="bg-orange-100 p-2 rounded text-sm">C</div>
                </HStack>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Gap 800</h4>
                <HStack gap="$800">
                    <div className="bg-teal-100 p-2 rounded text-sm">A</div>
                    <div className="bg-teal-100 p-2 rounded text-sm">B</div>
                    <div className="bg-teal-100 p-2 rounded text-sm">C</div>
                </HStack>
            </div>
        </div>
    );
}
