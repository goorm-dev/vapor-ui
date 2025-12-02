import { FORM_BLOCK_URL, NAVBAR_BLOCK_URL, TABLE_BLOCK_URL } from './image-urls';

export type Block = {
    id: string;
    name: string;
    description: string;
    href?: string;
    imageUrl?: string;
    isComingSoon?: boolean;
};

export const BLOCKS: Block[] = [
    {
        id: 'nav-bar',
        name: 'Navbar',
        description: 'NavBar는 사이트 상단에 위치하는 전역 내비게이션 컴포넌트입니다.',
        href: '/blocks/nav-bar',
        imageUrl: NAVBAR_BLOCK_URL,
    },
    {
        id: 'form',
        name: 'Form',
        description: 'Form은 사용자가 데이터를 입력하고 제출할 수 있는 인터페이스를 제공합니다.',
        href: '/blocks/form',
        imageUrl: FORM_BLOCK_URL,
    },
    {
        id: 'table',
        name: 'Table',
        description: '데이터를 행과 열 단위로 정리해 비교/분석할 수 있는 컴포넌트입니다.',
        href: '/blocks/table',
        imageUrl: TABLE_BLOCK_URL,
    },
];

export const COMING_SOON_BLOCKS: Block[] = [
    {
        id: 'dashboard',
        name: 'Dashboard',
        description: '사용자의 주요 데이터와 상태를 한눈에 볼 수 있도록 구성된 화면입니다.',
        isComingSoon: true,
    },

    {
        id: 'list',
        name: 'List',
        description: '동일한 유형의 정보를 반복적으로 보여주는 블록 컴포넌트입니다.',
        isComingSoon: true,
    },
    {
        id: 'search',
        name: 'Search',
        description: '키워드 기반으로 원하는 데이터를 빠르게 찾는 기능 컴포넌트입니다.',
        isComingSoon: true,
    },
    {
        id: 'funnel',
        name: 'Funnel',
        description: '단계별 전환 과정을 시각화한 컴포넌트입니다.',
        isComingSoon: true,
    },
    {
        id: 'chat',
        name: 'Chat',
        description: '실시간 대화형 인터페이스 블록 컴포넌트입니다.',
        isComingSoon: true,
    },
];

export const ALL_BLOCKS: Block[] = [...BLOCKS, ...COMING_SOON_BLOCKS];
