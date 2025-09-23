import { Badge, MultiSelect } from '@vapor-ui/core';

const languages = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    go: 'Go',
    rust: 'Rust',
};

export default function MultiSelectCustomValue() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-2">기본 배지 표시</h4>
                <MultiSelect.Root placeholder="언어 선택" items={languages}>
                    <MultiSelect.Trigger>
                        <MultiSelect.Value />
                        <MultiSelect.TriggerIcon />
                    </MultiSelect.Trigger>
                    <MultiSelect.Content>
                        {Object.entries(languages).map(([value, label]) => (
                            <MultiSelect.Item key={value} value={value}>
                                {label}
                                <MultiSelect.ItemIndicator />
                            </MultiSelect.Item>
                        ))}
                    </MultiSelect.Content>
                </MultiSelect.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">커스텀 값 표시 (최대 2개 + 더보기)</h4>
                <MultiSelect.Root placeholder="언어 선택" items={languages}>
                    <MultiSelect.Trigger>
                        <MultiSelect.Value>
                            {(value: string[]) => {
                                if (value.length === 0) {
                                    return (
                                        <MultiSelect.Placeholder>언어 선택</MultiSelect.Placeholder>
                                    );
                                }

                                const displayValues = value.slice(0, 2);
                                const remainingCount = value.length - 2;

                                return (
                                    <div className="flex gap-1 flex-wrap">
                                        {displayValues.map((val) => (
                                            <Badge key={val} size="sm">
                                                {languages[val as keyof typeof languages]}
                                            </Badge>
                                        ))}
                                        {remainingCount > 0 && (
                                            <Badge size="sm" color="hint">
                                                +{remainingCount} more
                                            </Badge>
                                        )}
                                    </div>
                                );
                            }}
                        </MultiSelect.Value>
                        <MultiSelect.TriggerIcon />
                    </MultiSelect.Trigger>
                    <MultiSelect.Content>
                        {Object.entries(languages).map(([value, label]) => (
                            <MultiSelect.Item key={value} value={value}>
                                {label}
                                <MultiSelect.ItemIndicator />
                            </MultiSelect.Item>
                        ))}
                    </MultiSelect.Content>
                </MultiSelect.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">문자열 형태 표시</h4>
                <MultiSelect.Root placeholder="언어 선택" items={languages}>
                    <MultiSelect.Trigger>
                        <MultiSelect.Value>
                            {(value: string[]) =>
                                value.length > 0 ? (
                                    value
                                        .map((v) => languages[v as keyof typeof languages])
                                        .join(', ')
                                ) : (
                                    <MultiSelect.Placeholder>언어 선택</MultiSelect.Placeholder>
                                )
                            }
                        </MultiSelect.Value>
                        <MultiSelect.TriggerIcon />
                    </MultiSelect.Trigger>
                    <MultiSelect.Content>
                        {Object.entries(languages).map(([value, label]) => (
                            <MultiSelect.Item key={value} value={value}>
                                {label}
                                <MultiSelect.ItemIndicator />
                            </MultiSelect.Item>
                        ))}
                    </MultiSelect.Content>
                </MultiSelect.Root>
            </div>
        </div>
    );
}
