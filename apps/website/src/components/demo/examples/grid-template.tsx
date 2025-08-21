import { Grid } from '@vapor-ui/core';

export default function GridTemplate() {
  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Template Columns</h4>
        <Grid.Root templateColumns="200px 1fr 100px" gap="2">
          <Grid.Item className="bg-blue-100 p-2 rounded text-center">200px</Grid.Item>
          <Grid.Item className="bg-blue-100 p-2 rounded text-center">1fr</Grid.Item>
          <Grid.Item className="bg-blue-100 p-2 rounded text-center">100px</Grid.Item>
        </Grid.Root>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Template Rows</h4>
        <Grid.Root templateColumns="1fr" templateRows="60px 1fr 40px" gap="2" className="h-40">
          <Grid.Item className="bg-green-100 p-2 rounded text-center">60px</Grid.Item>
          <Grid.Item className="bg-green-100 p-2 rounded text-center">1fr</Grid.Item>
          <Grid.Item className="bg-green-100 p-2 rounded text-center">40px</Grid.Item>
        </Grid.Root>
      </div>
    </div>
  );
}