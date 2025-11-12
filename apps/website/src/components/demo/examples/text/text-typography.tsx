import { Text } from '@vapor-ui/core';

export default function TextTypography() {
    return (
        <div className="flex flex-wrap gap-2">
            <Text typography="display1">Display1</Text>
            <Text typography="heading1">Heading1</Text>
            <Text typography="subtitle1">Subtitle1</Text>
            <Text typography="body1">Body1</Text>
        </div>
    );
}
