import ComponentsIcon from '../../../public/icons/intro-components.svg';
import StartedIcon from '../../../public/icons/intro-getting-started.svg';
import IconsIcon from '../../../public/icons/intro-like.svg';
import TokensIcon from '../../../public/icons/intro-token.svg';
import IntroLinkCard from '../intro-link-card';

const LINK_LIST = [
    {
        icon: <StartedIcon />,
        title: 'Getting Started',
        description:
            '디자인 시스템을 프로젝트에 빠르게 도입할 수 있는 설치 가이드와 기본 개념을 제공합니다.',
        link: '/docs/getting-started',
    },
    {
        icon: <TokensIcon />,
        title: 'Tokens',
        description:
            '일관된 UI를 위한 디자인 토큰(색상, 크기, 타이포그래피 등)의 정의와 사용법을 소개합니다.',
        link: '/docs/tokens/color',
    },
    {
        icon: <IconsIcon />,
        title: 'Icons',
        description: '디자인과 개발에 바로 활용할 수 있는 아이콘 모음을 제공합니다.',
        link: '/docs/icons',
    },
    {
        icon: <ComponentsIcon />,
        title: 'Components',
        description: '디자인 시스템에서 제공하는 UI 컴포넌트와 사용 가이드를 확인할 수 있습니다.',
        link: '/docs/components',
    },
];

const IntroLinkCardContainer = () => {
    return (
        <div className="not-prose grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-[var(--vapor-size-space-400)] w-full">
            {LINK_LIST.map((link) => (
                <IntroLinkCard
                    icon={link.icon}
                    key={link.title}
                    title={link.title}
                    description={link.description}
                    link={link.link}
                />
            ))}
        </div>
    );
};

export default IntroLinkCardContainer;
