import { input, select } from '@inquirer/prompts';

export type PromptResult =
    | { type: 'all' }
    | { type: 'component'; name: string };

export async function promptComponentSelection(): Promise<PromptResult> {
    const choice = await select({
        message: '처리 방식을 선택하세요',
        choices: [
            { name: '전체 컴포넌트 처리', value: 'all' },
            { name: '특정 컴포넌트 지정', value: 'component' },
        ],
    });

    if (choice === 'all') {
        return { type: 'all' };
    }

    const componentName = await input({
        message: '컴포넌트 이름을 입력하세요 (예: Button, TextInput)',
    });

    return { type: 'component', name: componentName };
}
