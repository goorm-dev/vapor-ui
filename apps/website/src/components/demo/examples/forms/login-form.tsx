import './index.css';

import { Button, Checkbox, HStack, TextInput, VStack } from '@vapor-ui/core';

export default function LoginForm() {
    return (
        <VStack
            gap="$250"
            width="400px"
            padding="$300"
            borderRadius="$300"
            border="1px solid #eee"
            className="login"
        >
            <VStack gap="$200">
                <VStack gap="$100">
                    <label htmlFor="login-email" className="input-label">
                        이메일
                    </label>
                    <TextInput id="login-email" />
                </VStack>
                <VStack gap="$100">
                    <label htmlFor="login-password" className="input-label">
                        비밀번호
                    </label>
                    <VStack gap="$050">
                        <TextInput id="login-password" />
                        <span className="helper-text">8~16자, 영문, 특수문자 포함</span>
                    </VStack>
                </VStack>
            </VStack>

            <VStack gap="$100">
                <HStack justifyContent="space-between">
                    <HStack alignItems="center" gap="$100">
                        <Checkbox.Root id="login-auto-login" />
                        <label htmlFor="login-auto-login" className="checkbox-label">
                            자동 로그인
                        </label>
                    </HStack>

                    <Button variant="ghost" color="secondary">
                        ID/비밀번호 찾기
                    </Button>
                </HStack>

                <Button>로그인</Button>
                <Button color="secondary" variant="outline">
                    회원가입
                </Button>
            </VStack>
        </VStack>
    );
}
