import { Field, Switch } from '@vapor-ui/core';

export default function App() {
    return (
        <div>
            <Switch.Root colorPalette="primary">
                <Switch.Thumb />
            </Switch.Root>
            <Field.Root>
                <Field.Label>
                    Enable notifications
                    <Switch.Root colorPalette="secondary">
                        <Switch.Thumb />
                    </Switch.Root>
                </Field.Label>
            </Field.Root>
        </div>
    );
}
