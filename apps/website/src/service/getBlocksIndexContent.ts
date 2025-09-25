import { BLOCKS, COMING_SOON_BLOCKS } from '~/constants/blocks';

export const getBlocksIndexContent = async (): Promise<string> => {
    // 사용 가능한 블록들 (실제 구현된 블록들)
    const availableBlocksList = BLOCKS.map(
        (block) => `- [${block.name}](${block.href}): ${block.description}`,
    ).join('\n');

    // 곧 출시될 블록들
    const comingSoonBlocksList = COMING_SOON_BLOCKS.map(
        (block) => `- ${block.name}: ${block.description} (출시 예정)`,
    ).join('\n');

    return `# Blocks
URL: /blocks
Source: https://raw.githubusercontent.com/goorm-dev/vapor-ui/refs/heads/main/apps/website/src/app/blocks/page.tsx

재사용 가능한 UI 블록 컴포넌트들의 모음입니다. 각 블록은 실제 프로젝트에서 바로 사용할 수 있는 완성된 컴포넌트입니다.

## 사용 가능한 블록들

${availableBlocksList}

## 곧 출시될 블록들

${comingSoonBlocksList}

각 블록은 복사하여 바로 사용할 수 있으며, 프로젝트에 맞게 커스터마이징할 수 있습니다.`;
};
