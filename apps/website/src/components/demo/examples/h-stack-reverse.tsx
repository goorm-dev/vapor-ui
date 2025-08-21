import { HStack } from '@vapor-ui/core';

export default function HStackReverse() {
    return (
        <div className="flex flex-wrap gap-2">
            <div>
                <h4 className="text-sm font-medium mb-2">Normal Stack</h4>
                <HStack gap="3">
                    <div className="bg-green-100 p-3 rounded text-center">First</div>
                    <div className="bg-green-200 p-3 rounded text-center">Second</div>
                    <div className="bg-green-300 p-3 rounded text-center">Third</div>
                </HStack>
            </div>
            
            <div>
                <h4 className="text-sm font-medium mb-2">Reverse Stack</h4>
                <HStack reverse gap="3">
                    <div className="bg-purple-100 p-3 rounded text-center">First</div>
                    <div className="bg-purple-200 p-3 rounded text-center">Second</div>
                    <div className="bg-purple-300 p-3 rounded text-center">Third</div>
                </HStack>
            </div>
        </div>
    );
}