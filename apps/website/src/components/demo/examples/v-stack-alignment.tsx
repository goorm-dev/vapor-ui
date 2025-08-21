import { VStack } from '@vapor-ui/core';

export default function VStackAlignment() {
    return (
        <div className="flex gap-8">
            <div>
                <h4 className="text-sm font-medium mb-2">Align Start</h4>
                <VStack gap="2" alignItems="start" className="w-32 bg-gray-50 p-2 rounded">
                    <div className="bg-blue-100 p-2 rounded text-sm">Short</div>
                    <div className="bg-blue-200 p-2 rounded text-sm">Medium Width</div>
                    <div className="bg-blue-300 p-2 rounded text-sm">Tiny</div>
                </VStack>
            </div>
            
            <div>
                <h4 className="text-sm font-medium mb-2">Align Center</h4>
                <VStack gap="2" alignItems="center" className="w-32 bg-gray-50 p-2 rounded">
                    <div className="bg-green-100 p-2 rounded text-sm">Short</div>
                    <div className="bg-green-200 p-2 rounded text-sm">Medium Width</div>
                    <div className="bg-green-300 p-2 rounded text-sm">Tiny</div>
                </VStack>
            </div>
            
            <div>
                <h4 className="text-sm font-medium mb-2">Align End</h4>
                <VStack gap="2" alignItems="end" className="w-32 bg-gray-50 p-2 rounded">
                    <div className="bg-purple-100 p-2 rounded text-sm">Short</div>
                    <div className="bg-purple-200 p-2 rounded text-sm">Medium Width</div>
                    <div className="bg-purple-300 p-2 rounded text-sm">Tiny</div>
                </VStack>
            </div>
        </div>
    );
}