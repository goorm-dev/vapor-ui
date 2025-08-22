import { Grid } from '@vapor-ui/core';

export default function GridInline() {
    return (
        <div className="flex flex-wrap gap-4">
            <div>
                <h4 className="text-sm font-medium mb-2">Block Grid (default)</h4>
                <Grid.Root templateColumns="repeat(2, 1fr)" gap="2">
                    <Grid.Item className="bg-indigo-100 p-2 rounded text-center">1</Grid.Item>
                    <Grid.Item className="bg-indigo-100 p-2 rounded text-center">2</Grid.Item>
                </Grid.Root>
                <p className="text-sm text-gray-600 mt-1">Block level grid</p>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Inline Grid</h4>
                <Grid.Root inline templateColumns="repeat(2, 1fr)" gap="2">
                    <Grid.Item className="bg-pink-100 p-2 rounded text-center">1</Grid.Item>
                    <Grid.Item className="bg-pink-100 p-2 rounded text-center">2</Grid.Item>
                </Grid.Root>
                <span className="text-sm text-gray-600 ml-2">Inline grid</span>
            </div>
        </div>
    );
}
