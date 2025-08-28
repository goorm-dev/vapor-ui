import { useState } from 'react';

import { Button, Checkbox } from '@vapor-ui/core';

export default function CheckboxForm() {
    const [formData, setFormData] = useState({
        terms: false,
        newsletter: false,
        notifications: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Checkbox.Root
                checked={formData.terms}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, terms: checked }))}
                required
            >
                <Checkbox.Control />
                <Checkbox.Label>이용약관에 동의합니다 (필수)</Checkbox.Label>
            </Checkbox.Root>

            <Checkbox.Root
                checked={formData.newsletter}
                onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, newsletter: checked }))
                }
            >
                <Checkbox.Control />
                <Checkbox.Label>뉴스레터 수신에 동의합니다 (선택)</Checkbox.Label>
            </Checkbox.Root>

            <Checkbox.Root
                checked={formData.notifications}
                onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, notifications: checked }))
                }
            >
                <Checkbox.Control />
                <Checkbox.Label>알림 수신 설정</Checkbox.Label>
            </Checkbox.Root>

            <Button type="submit" disabled={!formData.terms}>
                제출
            </Button>
        </form>
    );
}
