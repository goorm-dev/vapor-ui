import { Switch } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <div>
            <Switch color="primary">
                <Switch.Indicator />
            </Switch>
            <Switch color="secondary">
                <Switch.Label>Enable notifications</Switch.Label>
                <Switch.Indicator />
            </Switch>
        </div>
    );
}
