import { Switch } from '@vapor-ui/core';

export default function SwitchVisuallyHidden() {
    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-sm font-medium mb-2">기본 라벨</h4>
                <Switch.Root>
                    <Switch.Label>보이는 라벨</Switch.Label>
                    <Switch.Control />
                </Switch.Root>
            </div>
            
            <div>
                <h4 className="text-sm font-medium mb-2">시각적으로 숨겨진 라벨</h4>
                <Switch.Root visuallyHidden aria-label="숨겨진 스위치">
                    <Switch.Control />
                </Switch.Root>
            </div>
        </div>
    );
}