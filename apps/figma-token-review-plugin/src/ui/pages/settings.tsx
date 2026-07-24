import { useState } from 'react';

import { Button, Card, HStack, Text, TextInput, VStack } from '@vapor-ui/core';

import { toastManager } from '../components/toast';
import { useApiKey } from '../features/api-key';

type Props = {
    onClose: () => void;
};

function maskKey(key: string): string {
    if (key.length <= 8) return '••••';
    return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

export function SettingsPage({ onClose }: Props) {
    const { state, save, clear } = useApiKey();
    const [draft, setDraft] = useState('');

    const hasKey = state.kind === 'present';
    const currentKey = state.kind === 'present' ? state.key : '';

    const handleSave = () => {
        const trimmed = draft.trim();
        if (!trimmed) {
            toastManager.add({ title: 'API 키를 입력해 주세요.', colorPalette: 'danger' });
            return;
        }

        save(trimmed);
        setDraft('');

        toastManager.add({ title: 'API 키가 저장되었습니다.', colorPalette: 'success' });
        onClose?.();
    };

    const handleClear = () => {
        clear();
        toastManager.add({ title: 'API 키가 삭제되었습니다.', colorPalette: 'info' });
    };

    return (
        <VStack className="gap-4 p-6">
            <VStack className="gap-1">
                <Text typography="heading5" foreground="normal-200">
                    LiteLLM API 키 설정
                </Text>
                <Text typography="body2" foreground="hint-100">
                    관리자에게 발급 받은 개인 키를 입력해 주세요. 키는 이 브라우저에만 저장되며
                    번들에는 포함되지 않습니다.
                </Text>
            </VStack>

            {hasKey && (
                <Card.Root className="gap-2">
                    <Card.Body className="p-3">
                        <Text typography="body3" foreground="hint-100">
                            저장된 키
                        </Text>
                        <Text typography="body2" foreground="normal-200">
                            {maskKey(currentKey)}
                        </Text>
                    </Card.Body>
                </Card.Root>
            )}

            <VStack className="gap-2">
                <Text typography="body3" foreground="normal-200">
                    {hasKey ? '새 키로 교체' : 'API 키'}
                </Text>
                <TextInput
                    type="password"
                    placeholder="sk-..."
                    value={draft}
                    onValueChange={setDraft}
                />
            </VStack>

            <HStack $css={{ justifyContent: 'space-between' }}>
                {hasKey && (
                    <Button colorPalette="danger" variant="outline" size="md" onClick={handleClear}>
                        키 삭제
                    </Button>
                )}
                <HStack $css={{ gap: '$050', justifyContent: 'flex-end' }}>
                    <Button variant="ghost" size="md" onClick={onClose}>
                        닫기
                    </Button>
                    <Button colorPalette="primary" variant="fill" size="md" onClick={handleSave}>
                        저장
                    </Button>
                </HStack>
            </HStack>
        </VStack>
    );
}
