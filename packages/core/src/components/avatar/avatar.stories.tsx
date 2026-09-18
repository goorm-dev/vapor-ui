import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar } from '.';
import { Flex } from '../flex';

export default {
    title: 'Avatar',
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
        shape: { control: 'inline-radio', options: ['square', 'circle'] },
    },
} as Meta<typeof Avatar>;

type Story = StoryObj<typeof Avatar>;

const IMAGE_URL = 'https://avatars.githubusercontent.com/u/217160984?v=4';

export const Default: Story = {
    render: (args) => (
        <>
            <Flex>
                <Avatar.Root size="sm" src={IMAGE_URL} {...args} alt="hi" />
                <Avatar.Root size="md" src={IMAGE_URL} {...args} alt="hi" />
                <Avatar.Root size="lg" src={IMAGE_URL} {...args} alt="hi" />
                <Avatar.Root size="xl" src={IMAGE_URL} {...args} alt="hi">
                    <Avatar.ImagePrimitive />
                    <Avatar.FallbackPrimitive>hi</Avatar.FallbackPrimitive>
                </Avatar.Root>
            </Flex>
            <Flex>
                <Avatar.Root size="sm" {...args} alt="1" />
                <Avatar.Root size="md" {...args} alt="2" />
                <Avatar.Root size="lg" {...args} alt="3" />
                <Avatar.Root size="xl" {...args} alt="4" />
            </Flex>
            <Flex>
                <Avatar.Root size="sm" {...args} alt="noah.choi" />
                <Avatar.Root size="md" {...args} alt="noah.choi" />
                <Avatar.Root size="lg" {...args} alt="noah.choi" />
                <Avatar.Root size="xl" {...args} alt="noah.choi">
                    <Avatar.ImagePrimitive />
                    <Avatar.FallbackPrimitive>ㅇㅇ</Avatar.FallbackPrimitive>
                </Avatar.Root>
            </Flex>
        </>
    ),
};

export const TestBed: Story = {
    render: (args) => (
        <>
            <Flex>
                <Avatar.Root size="sm" src={IMAGE_URL} {...args} alt="hi" />
                <Avatar.Root size="md" src={IMAGE_URL} {...args} alt="hi" />
                <Avatar.Root size="lg" src={IMAGE_URL} {...args} alt="hi" />
                <Avatar.Root size="xl" src={IMAGE_URL} {...args} alt="hi" />
            </Flex>
            <Flex>
                <Avatar.Root size="sm" {...args} alt="1" />
                <Avatar.Root size="md" {...args} alt="2" />
                <Avatar.Root size="lg" {...args} alt="3" />
                <Avatar.Root size="xl" {...args} alt="4" />
            </Flex>
            <Flex>
                <Avatar.Root size="sm" {...args} alt="noah.choi" />
                <Avatar.Root size="md" {...args} alt="noah.choi" />
                <Avatar.Root size="lg" {...args} alt="noah.choi" />
                <Avatar.Root size="xl" {...args} alt="noah.choi" />
            </Flex>
        </>
    ),
};

/* -------------------------------------------------------------------------------------------------
 * keepMounted — 스타일 검증용
 * -----------------------------------------------------------------------------------------------*/

const BROKEN_URL = 'https://example.invalid/not-an-image.png';

/**
 * keepMounted를 켜면 로딩 중·에러 시 image와 fallback이 DOM에 공존한다.
 * 현재 avatar.css.ts는 둘 다 positioned가 아니라 이 공존을 전제하지 않는다.
 * A~D를 나란히 비교해 어떤 CSS가 필요한지 눈으로 확인하는 스토리.
 */
const STACK_STYLES = `
.kmStack { position: relative; }
.kmStack > * { position: absolute; inset: 0; }
.kmHide[data-loading],
.kmHide[data-error] { visibility: hidden; }
`;

const Row = ({
    label,
    rootClassName,
    imageClassName,
    keepMounted,
    delay,
}: {
    label: string;
    rootClassName?: string;
    imageClassName?: string;
    keepMounted?: boolean;
    delay?: number;
}) => (
    <Flex flexDirection="column" gap="$100">
        <strong style={{ fontSize: 12 }}>{label}</strong>
        <Flex gap="$200" alignItems="center">
            {(
                [
                    ['loaded', IMAGE_URL],
                    ['error', BROKEN_URL],
                    ['no src', undefined],
                ] as const
            ).map(([state, src]) => (
                <Flex key={state} flexDirection="column" alignItems="center" gap="$050">
                    <Avatar.Root
                        size="xl"
                        shape="circle"
                        src={src}
                        alt="noah.choi"
                        keepMounted={keepMounted}
                        delay={delay}
                        className={rootClassName}
                    >
                        <Avatar.ImagePrimitive className={imageClassName} />
                        <Avatar.FallbackPrimitive />
                    </Avatar.Root>
                    <span style={{ fontSize: 11, opacity: 0.6 }}>{state}</span>
                </Flex>
            ))}
        </Flex>
    </Flex>
);

export const KeepMounted: Story = {
    render: () => (
        <>
            <style>{STACK_STYLES}</style>
            <Flex flexDirection="column" gap="$300">
                <Row label="A. keepMounted + 현재 스타일 (겹치기 없음)" keepMounted />
                <Row label="B. keepMounted + 겹치기만" keepMounted rootClassName="kmStack" />
                <Row
                    label="C. keepMounted + 겹치기 + data-loading/data-error 숨김"
                    keepMounted
                    rootClassName="kmStack"
                    imageClassName="kmHide"
                />
                <Row
                    label="E. keepMounted + 겹치기만 + delay 600 — fallback이 지연되는 구간"
                    keepMounted
                    delay={600}
                    rootClassName="kmStack"
                />
                <Row
                    label="F. keepMounted + 겹치기 + 숨김 + delay 600"
                    keepMounted
                    delay={600}
                    rootClassName="kmStack"
                    imageClassName="kmHide"
                />
                <Row label="D. 참조 — keepMounted 없음 (현재 기본 동작)" />
            </Flex>
        </>
    ),
};
