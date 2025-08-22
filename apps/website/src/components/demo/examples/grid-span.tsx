import { Grid } from '@vapor-ui/core';

export default function GridSpan() {
    return (
        <div className="flex flex-wrap gap-4">
            <div>
                <h4 className="text-sm font-medium mb-2">Column Span</h4>
                <Grid.Root templateColumns="repeat(4, 1fr)" gap="2">
                    <Grid.Item className="bg-red-100 p-2 rounded text-center">1</Grid.Item>
                    <Grid.Item colSpan="2" className="bg-red-200 p-2 rounded text-center">
                        Span 2
                    </Grid.Item>
                    <Grid.Item className="bg-red-100 p-2 rounded text-center">4</Grid.Item>
                    <Grid.Item colSpan="3" className="bg-red-200 p-2 rounded text-center">
                        Span 3
                    </Grid.Item>
                    <Grid.Item className="bg-red-100 p-2 rounded text-center">8</Grid.Item>
                </Grid.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Row Span</h4>
                <Grid.Root templateColumns="repeat(3, 1fr)" gap="2">
                    <Grid.Item rowSpan="2" className="bg-teal-200 p-2 rounded text-center">
                        Row Span 2
                    </Grid.Item>
                    <Grid.Item className="bg-teal-100 p-2 rounded text-center">2</Grid.Item>
                    <Grid.Item className="bg-teal-100 p-2 rounded text-center">3</Grid.Item>
                    <Grid.Item className="bg-teal-100 p-2 rounded text-center">5</Grid.Item>
                    <Grid.Item className="bg-teal-100 p-2 rounded text-center">6</Grid.Item>
                </Grid.Root>
            </div>
        </div>
    );
}
