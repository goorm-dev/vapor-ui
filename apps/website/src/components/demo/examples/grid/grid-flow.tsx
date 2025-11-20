import { Grid } from '@vapor-ui/core';

export default function GridFlow() {
    return (
        <div className="flex flex-wrap gap-4">
            <div>
                <h4 className="text-sm font-medium mb-2">Row Flow</h4>
                <Grid.Root templateColumns="repeat(3, 1fr)" flow="row" gap="2">
                    <Grid.Item className="bg-purple-100 p-2 rounded text-center">1</Grid.Item>
                    <Grid.Item className="bg-purple-100 p-2 rounded text-center">2</Grid.Item>
                    <Grid.Item className="bg-purple-100 p-2 rounded text-center">3</Grid.Item>
                    <Grid.Item className="bg-purple-100 p-2 rounded text-center">4</Grid.Item>
                    <Grid.Item className="bg-purple-100 p-2 rounded text-center">5</Grid.Item>
                </Grid.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Column Flow</h4>
                <Grid.Root templateRows="repeat(3, 1fr)" flow="column" gap="2" className="h-32">
                    <Grid.Item className="bg-orange-100 p-2 rounded text-center">1</Grid.Item>
                    <Grid.Item className="bg-orange-100 p-2 rounded text-center">2</Grid.Item>
                    <Grid.Item className="bg-orange-100 p-2 rounded text-center">3</Grid.Item>
                    <Grid.Item className="bg-orange-100 p-2 rounded text-center">4</Grid.Item>
                    <Grid.Item className="bg-orange-100 p-2 rounded text-center">5</Grid.Item>
                </Grid.Root>
            </div>
        </div>
    );
}
