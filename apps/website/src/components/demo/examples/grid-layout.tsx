import { Grid } from '@vapor-ui/core';

export default function GridLayout() {
  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Dashboard Layout</h4>
        <Grid.Root templateColumns="200px 1fr" templateRows="60px 1fr 40px" gap="2" className="h-64 w-full max-w-md">
          <Grid.Item colSpan="2" className="bg-gray-200 p-2 rounded flex items-center justify-center font-medium">
            Header
          </Grid.Item>
          <Grid.Item className="bg-blue-100 p-2 rounded flex items-center justify-center">
            Sidebar
          </Grid.Item>
          <Grid.Item className="bg-green-100 p-2 rounded flex items-center justify-center">
            Main Content
          </Grid.Item>
          <Grid.Item colSpan="2" className="bg-gray-200 p-2 rounded flex items-center justify-center font-medium">
            Footer
          </Grid.Item>
        </Grid.Root>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Card Layout</h4>
        <Grid.Root templateColumns="repeat(auto-fit, minmax(120px, 1fr))" gap="2" className="w-full max-w-md">
          <Grid.Item className="bg-yellow-100 p-4 rounded text-center">Card 1</Grid.Item>
          <Grid.Item className="bg-yellow-100 p-4 rounded text-center">Card 2</Grid.Item>
          <Grid.Item className="bg-yellow-100 p-4 rounded text-center">Card 3</Grid.Item>
          <Grid.Item className="bg-yellow-100 p-4 rounded text-center">Card 4</Grid.Item>
        </Grid.Root>
      </div>
    </div>
  );
}