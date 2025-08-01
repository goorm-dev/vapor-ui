'use client';

import { createContext, useContext, useState } from 'react';

import {
    Badge,
    Button,
    Card,
    LocalThemeProvider,
    RadioGroup,
    Text,
    TextInput,
} from '@vapor-ui/core';
import {
    AchievementIcon,
    CloseOutlineIcon,
    CreditCardIcon,
    DragIndicatorIcon,
    NoticeCircleIcon,
    PlusOutlineIcon,
    SearchOutlineIcon,
} from '@vapor-ui/icons';
import clsx from 'clsx';
import Image from 'next/image';

import BrowserControlsIcon from '~public/icons/browser-controls.svg';
import SecureIcon from '~public/icons/secure.svg';
import SwitchIcon from '~public/icons/switch-icon.svg';
import TabLeftCurvedIcon from '~public/icons/tab-left-curved.svg';
import TabRightCurvedIcon from '~public/icons/tab-right-curved.svg';

import { UserList } from './user-list';

type LocalTheme = 'light' | 'dark';

interface LocalThemeContextType {
    theme: LocalTheme;
    setTheme: (theme: LocalTheme) => void;
}

const LocalThemeContext = createContext<LocalThemeContextType | undefined>(undefined);

export const useLocalTheme = () => {
    const context = useContext(LocalThemeContext);
    if (!context) {
        throw new Error('useLocalTheme must be used within LocalThemeProvider');
    }
    return context;
};

interface ChromeWindowProps {
    className?: string;
    theme?: 'light' | 'dark';
}

export function ChromeWindow({ className = '', theme = 'light' }: ChromeWindowProps) {
    // 가격 입력 상태 및 계산
    const [count, setCount] = useState(100);
    const pricePerItem = 20;
    const totalPrice = count > 0 ? count * pricePerItem : 0;

    // 사용자 검색 상태
    const [searchQuery, setSearchQuery] = useState('');

    // 결제 방법 상태
    const [paymentMethod, setPaymentMethod] = useState('card');

    const handleCountChange = (value: string) => {
        const numeric = value.replace(/[^0-9]/g, '');
        setCount(numeric === '' ? 0 : parseInt(numeric, 10));
    };

    // 컴포넌트 내에서 사용할 users 예시 데이터 추가
    const activeUsers = [
        { name: '박서현', badge: '나', online: true, avatarAlt: '박서현' },
        {
            name: '윤서진',
            badge: '강의자',
            online: true,
            avatarAlt: '윤서진',
        },
        { name: '최하은', online: true, avatarAlt: '최하은' },
        { name: '신도윤', online: true, avatarAlt: '신도윤' },
        { name: '윤하린', online: true, avatarAlt: '윤하린' },
    ];

    const unActiveUsers = [
        { name: '김서윤', lastActiveDaysAgo: 10, online: false, avatarAlt: '김서윤' },
        { name: '한유진', lastActiveDaysAgo: 5, online: false, avatarAlt: '한유진' },
    ];

    // 검색 필터링 로직
    const filterUsers = (users: typeof activeUsers) => {
        if (!searchQuery.trim()) return users;
        return users.filter((user) => user.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    };

    const filteredActiveUsers = filterUsers(activeUsers);
    const filteredUnActiveUsers = filterUsers(unActiveUsers);

    return (
        <LocalThemeProvider config={{ appearance: theme }} className="w-full">
            <div
                className={clsx(
                    'bg-[var(--vapor-color-background-normal)] rounded-[var(--vapor-size-borderRadius-500)] shadow-lg overflow-hidden w-full border border-[var(--vapor-color-border-normal)]',
                    className,
                )}
            >
                {/* Window Controls */}
                <div className="h-[42px] px-3  flex items-center justify-start bg-[var(--vapor-color-background-normal-lighter)] border-b border-[var(--vapor-color-border-normal)] gap-[7px]">
                    <div className="flex items-center gap-2">
                        <BrowserControlsIcon />
                    </div>
                    <div className="relative bottom-[-4px]">
                        <span className="absolute left-[-6px] bottom-0">
                            <TabLeftCurvedIcon color="var(--vapor-color-background-secondary" />
                        </span>
                        <div className="flex items-center gap-[9px] p-[var(--vapor-size-space-100)] pl-[var(--vapor-size-space-200)] min-w-0 flex-shrink-0 relative bg-[var(--vapor-color-background-secondary)] rounded-t-[var(--vapor-size-borderRadius-300)]">
                            <div className="flex gap-[9px]">
                                <Text typography="subtitle2" foreground="normal">
                                    Vapor UI
                                </Text>
                                <CloseOutlineIcon
                                    size="18"
                                    color="var(--vapor-color-foreground-secondary-darker)"
                                />
                            </div>
                        </div>
                        <span className="absolute right-[-6px] bottom-0">
                            <TabRightCurvedIcon color="var(--vapor-color-background-secondary)" />
                        </span>
                    </div>
                </div>

                <div className="flex h-[38px] bg-[var(--vapor-color-background-secondary)] items-center px-3">
                    <div className="h-[28px] rounded-[14px] bg-[var(--vapor-color-background-normal)] w-full">
                        <div className="flex items-center gap-2 px-3 py-1 h-full">
                            <SecureIcon color="var(--vapor-color-foreground-secondary)" />
                            <Text typography="subtitle2" foreground="secondary">
                                Vapor UI Playground
                            </Text>
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--vapor-color-background-normal)] flex items-center justify-center max-[767px]:px-0 h-[900px]">
                    <div className="flex items-start gap-[var(--vapor-size-space-400)] w-full h-full">
                        <div className="flex items-center flex-col gap-[var(--vapor-size-space-400)] flex-1 pt-[var(--vapor-size-space-400)] pl-[var(--vapor-size-space-400)] max-[991px]:p-[var(--vapor-size-space-400)] max-[767px]:px-0 max-[767px]:py-[var(--vapor-size-space-400)]">
                            <Card.Root className="w-full max-[767px]:border-l-0 max-[767px]:border-r-0 max-[767px]:rounded-none">
                                <Card.Header>
                                    <Text typography="heading6" foreground="normal" asChild>
                                        <h6>크레딧 구매</h6>
                                    </Text>
                                </Card.Header>
                                <Card.Body>
                                    <div className="flex items-center gap-[var(--vapor-size-space-400)] flex-col">
                                        <div className="w-full">
                                            <TextInput.Root
                                                placeholder="100"
                                                className="w-full"
                                                size="xl"
                                                value={count === 0 ? '' : String(count)}
                                                onValueChange={handleCountChange}
                                            >
                                                <TextInput.Field
                                                    className="w-full"
                                                    inputMode="numeric"
                                                />
                                            </TextInput.Root>
                                            <Button
                                                size="lg"
                                                color="secondary"
                                                stretch
                                                variant="outline"
                                                className="mt-2"
                                            >
                                                <span className="flex items-center gap-[var(--vapor-size-space-100)]">
                                                    <PlusOutlineIcon
                                                        size="20"
                                                        color="var(--vapor-color-foreground-secondary-darker)"
                                                    />
                                                    <Text
                                                        typography="subtitle1"
                                                        foreground="secondary-darker"
                                                    >
                                                        {count}개 추가
                                                    </Text>
                                                </span>
                                            </Button>
                                        </div>
                                        <div className="w-full h-[1px] bg-[var(--vapor-color-border-normal)]"></div>
                                        <div className="flex flex-col w-full items-center justify-between gap-[var(--vapor-size-space-050)]">
                                            <div className="flex items-center gap-2 w-full justify-between">
                                                <Text typography="heading5" foreground="normal">
                                                    최종 가격
                                                </Text>
                                                <Text typography="heading6" foreground="primary">
                                                    {totalPrice.toLocaleString()}원
                                                </Text>
                                            </div>
                                            <div className="flex items-center gap-2 w-full justify-between">
                                                <Text typography="subtitle2" foreground="secondary">
                                                    1,000원부터 결제할 수 있습니다.
                                                </Text>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card.Root>
                            <Card.Root className="w-full max-[767px]:border-l-0 max-[767px]:border-r-0 max-[767px]:rounded-none">
                                <Card.Body className="flex flex-col items-start gap-[var(--vapor-size-space-250)] self-stretch">
                                    <div className="flex items-center gap-[var(--vapor-size-space-200)] self-stretch">
                                        <Image
                                            src="https://statics.goorm.io/exp/v1/svgs/light/badge_success.svg"
                                            alt="Success badge"
                                            width={64}
                                            height={64}
                                        />

                                        <div className="flex flex-col justify-center items-start gap-[var(--vapor-size-space-100)]">
                                            <div className="flex flex-col items-start gap-[var(--vapor-size-space-025)] self-stretch">
                                                <Text typography="heading5" foreground="normal">
                                                    출석체크
                                                </Text>
                                                <Text typography="body3" foreground="hint-darker">
                                                    출석 체크하고 포인트를 획득하세요!
                                                </Text>
                                            </div>
                                            <div className="flex items-center gap-[var(--vapor-size-space-050)] self-stretch">
                                                <Text typography="subtitle1" foreground="secondary">
                                                    4회
                                                </Text>
                                                <Text typography="subtitle1" foreground="hint">
                                                    /
                                                </Text>
                                                <Text typography="subtitle1" foreground="hint">
                                                    5회
                                                </Text>
                                            </div>
                                        </div>
                                    </div>
                                    <Button size="lg" stretch>
                                        <AchievementIcon size="20" />
                                        <Text typography="subtitle1" foreground="accent">
                                            45 포인트 획득
                                        </Text>
                                    </Button>
                                </Card.Body>
                            </Card.Root>
                            <Card.Root className="w-full max-[767px]:border-l-0 max-[767px]:border-r-0 max-[767px]:rounded-none">
                                <Card.Header>
                                    <Text asChild foreground="normal" typography="heading6">
                                        <h6>템플릿 리스트</h6>
                                    </Text>
                                </Card.Header>
                                <Card.Body>
                                    <ul className="flex flex-col w-full gap-[var(--vapor-size-space-200)]">
                                        {Array.from({ length: 4 }).map((_, index) => (
                                            <li
                                                key={index}
                                                className="flex pb-[var(--vapor-size-space-100)] items-center gap-[var(--vapor-size-space-100)] self-stretch border-b border-[var(--vapor-color-border-normal)]"
                                            >
                                                <Text typography="subtitle1" foreground="secondary">
                                                    Template {index + 1}
                                                </Text>
                                                {index === 0 && (
                                                    <Badge color="primary" size="sm">
                                                        <Text typography="subtitle2">기본</Text>
                                                    </Badge>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </Card.Body>
                            </Card.Root>
                        </div>
                        <div className="flex flex-col items-start gap-6 flex-1 pt-[var(--vapor-size-space-400)] max-[1199px]:hidden">
                            <Card.Root className="w-full">
                                <Card.Body>
                                    <RadioGroup.Root
                                        name="payment-method"
                                        value={paymentMethod}
                                        onValueChange={setPaymentMethod}
                                        className="flex flex-col gap-4"
                                    >
                                        <RadioGroup.Item value="card">
                                            <RadioGroup.Control />
                                            <RadioGroup.Label>
                                                <div className="flex items-center gap-[var(--vapor-size-space-050)]">
                                                    <CreditCardIcon
                                                        size="16"
                                                        color="var(--vapor-color-foreground-normal)"
                                                    />
                                                    <Text typography="body2" foreground="normal">
                                                        체크/신용 카드
                                                    </Text>
                                                </div>
                                            </RadioGroup.Label>
                                        </RadioGroup.Item>
                                        <RadioGroup.Item value="naverpay">
                                            <RadioGroup.Control />
                                            <RadioGroup.Label>
                                                <Text typography="body2" foreground="normal">
                                                    네이버페이
                                                </Text>
                                            </RadioGroup.Label>
                                        </RadioGroup.Item>
                                        <RadioGroup.Item value="payco">
                                            <RadioGroup.Control />
                                            <RadioGroup.Label>
                                                <Text typography="body2" foreground="normal">
                                                    Payco 간편결제
                                                </Text>
                                            </RadioGroup.Label>
                                        </RadioGroup.Item>
                                    </RadioGroup.Root>
                                </Card.Body>
                            </Card.Root>
                            <table className="w-full">
                                <thead>
                                    <tr className="h-[var(--vapor-size-dimension-500)] bg-[var(--vapor-color-background-normal-darker)] border-b border-[var(--vapor-color-border-normal)]">
                                        <th className="w-[101px] px-[var(--vapor-size-space-300)] text-left align-middle">
                                            <Text
                                                typography="subtitle1"
                                                foreground="normal-lighter"
                                            >
                                                순서
                                            </Text>
                                        </th>
                                        <th className="px-[var(--vapor-size-space-300)] text-left align-middle">
                                            <Text
                                                typography="subtitle1"
                                                foreground="normal-lighter"
                                            >
                                                제목
                                            </Text>
                                        </th>
                                        <th className="w-[84px] px-[var(--vapor-size-space-300)] text-left align-middle">
                                            <Text
                                                typography="subtitle1"
                                                foreground="normal-lighter"
                                            >
                                                난이도
                                            </Text>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="h-[53px]">
                                        <td className="w-[101px] h-[53px] border-b border-[var(--vapor-color-border-normal)]">
                                            <div className="flex p-[var(--vapor-size-space-300)] items-center gap-[var(--vapor-size-space-100)] flex-1 self-stretch">
                                                <DragIndicatorIcon
                                                    size="20"
                                                    color="var(--vapor-color-foreground-hint)"
                                                />
                                                <Text
                                                    typography="body2"
                                                    foreground="normal-lighter"
                                                >
                                                    1
                                                </Text>
                                            </div>
                                        </td>
                                        <td className="h-[53px] p-[var(--vapor-size-space-200)] border-b border-[var(--vapor-color-border-normal)]">
                                            <div className="flex flex-col items-start flex-1">
                                                <Text typography="body2" foreground="normal">
                                                    구름 조각 모아보기
                                                </Text>
                                                <Text typography="body3" foreground="hint">
                                                    O/X 유형
                                                </Text>
                                            </div>
                                        </td>
                                        <td className="w-[84px] h-[53px] border-b border-[var(--vapor-color-border-normal)]">
                                            <div
                                                className="flex h-[54px] px-6 items-center gap-2 self-stretch"
                                                style={{ padding: '10px 24px 11px 24px' }}
                                            >
                                                <div className="inline-flex items-center px-2 py-1 rounded-[16px] bg-[rgba(143,211,39,0.16)] whitespace-nowrap">
                                                    <Text
                                                        typography="subtitle2"
                                                        className="text-[var(--vapor-color-lime-700)]"
                                                    >
                                                        쉬움
                                                    </Text>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="h-[53px]">
                                        <td className="w-[101px] h-[53px] border-b border-[var(--vapor-color-border-normal)]">
                                            <div className="flex p-[var(--vapor-size-space-300)] items-center gap-[var(--vapor-size-space-100)] flex-1 self-stretch">
                                                <DragIndicatorIcon
                                                    size="20"
                                                    color="var(--vapor-color-foreground-hint)"
                                                />
                                                <Text
                                                    typography="body2"
                                                    foreground="normal-lighter"
                                                >
                                                    2
                                                </Text>
                                            </div>
                                        </td>
                                        <td className="h-[53px] p-[var(--vapor-size-space-200)] border-b border-[var(--vapor-color-border-normal)]">
                                            <div className="flex flex-col items-start flex-1">
                                                <Text
                                                    typography="body2"
                                                    foreground="normal"
                                                    className="truncate max-w-full"
                                                >
                                                    World wide web
                                                </Text>
                                                <Text typography="body3" foreground="hint">
                                                    객관식 유형
                                                </Text>
                                            </div>
                                        </td>
                                        <td className="w-[84px] h-[53px] border-b border-[var(--vapor-color-border-normal)]">
                                            <div
                                                className="flex h-[54px] px-6 items-center gap-2 self-stretch"
                                                style={{ padding: '10px 24px 11px 24px' }}
                                            >
                                                <div className="inline-flex items-center px-2 py-1 rounded-[16px] bg-[rgba(218,47,116,0.16)] whitespace-nowrap">
                                                    <Text
                                                        typography="subtitle2"
                                                        className="text-[var(--vapor-color-pink-700)]"
                                                    >
                                                        어려움
                                                    </Text>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="h-[53px]">
                                        <td className="w-[101px] h-[53px] border-b border-[var(--vapor-color-border-normal)]">
                                            <div className="flex p-[var(--vapor-size-space-300)] items-center gap-[var(--vapor-size-space-100)] flex-1 self-stretch">
                                                <DragIndicatorIcon
                                                    size="20"
                                                    color="var(--vapor-color-foreground-hint)"
                                                />
                                                <Text
                                                    typography="body2"
                                                    foreground="normal-lighter"
                                                >
                                                    3
                                                </Text>
                                            </div>
                                        </td>
                                        <td className="h-[53px] p-[var(--vapor-size-space-200)] border-b border-[var(--vapor-color-border-normal)]">
                                            <div className="flex flex-col items-start flex-1">
                                                <Text
                                                    typography="body2"
                                                    foreground="normal"
                                                    className="truncate max-w-full"
                                                >
                                                    World wide web
                                                </Text>
                                                <Text typography="body3" foreground="hint">
                                                    서술형 유형
                                                </Text>
                                            </div>
                                        </td>
                                        <td className="w-[84px] h-[53px] border-b border-[var(--vapor-color-border-normal)]">
                                            <div
                                                className="flex h-[54px] px-6 items-center gap-2 self-stretch"
                                                style={{ padding: '10px 24px 11px 24px' }}
                                            >
                                                <div className="inline-flex items-center px-2 py-1 rounded-[16px] bg-[rgba(14,129,160,0.16)] whitespace-nowrap">
                                                    <Text
                                                        typography="subtitle2"
                                                        className="text-[var(--vapor-color-cyan-700)]"
                                                    >
                                                        보통
                                                    </Text>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Dialog-styled Component */}
                            <div className="flex flex-col items-end self-stretch rounded-[var(--vapor-size-borderRadius-300)] bg-[var(--vapor-color-background-normal)] shadow-[0_16px_32px_0_rgba(0,0,0,0.20)]">
                                {/* Header */}
                                <div className="flex h-[var(--vapor-size-dimension-700)] px-[var(--vapor-size-space-300)] py-0 items-center gap-[var(--vapor-size-space-150)] self-stretch">
                                    {/* Header content can go here */}
                                </div>

                                {/* Body/Contents */}
                                <div className="flex  flex-col items-center gap-[var(--vapor-size-space-200)] self-stretch">
                                    <div className="flex px-[var(--vapor-size-space-300)] py-0 flex-col items-start self-stretch">
                                        <div className="flex flex-col items-center gap-[var(--vapor-size-space-200)] self-stretch">
                                            <NoticeCircleIcon
                                                size="100"
                                                color="var(--vapor-color-foreground-primary)"
                                                className="w-[100px] h-[100px]"
                                            />
                                            <div
                                                className="self-stretch text-center text-[var(--vapor-color-foreground-normal)]"
                                                style={{
                                                    fontFamily: 'Pretendard',
                                                    fontSize: '18px',
                                                    fontStyle: 'normal',
                                                    fontWeight: 700,
                                                    lineHeight: '26px',
                                                    letterSpacing: '-0.1px',
                                                    fontFeatureSettings: "'liga' off, 'clig' off",
                                                }}
                                            >
                                                이 컨테이너를 Public으로 변경하시겠어요?
                                            </div>

                                            {/* Information Section */}
                                            <div className="flex p-[var(--vapor-size-space-200)] flex-col items-start gap-[var(--vapor-size-space-100)] self-stretch rounded-[var(--vapor-size-borderRadius-300)] bg-[rgba(148,150,163,0.08)]">
                                                <Text
                                                    typography="subtitle1"
                                                    foreground="hint-darker"
                                                >
                                                    Public으로 설정 시 이런게 바뀌어요
                                                </Text>
                                                <ul className="flex flex-col gap-[var(--vapor-size-space-050)]">
                                                    <li className="flex items-center gap-2 leading-[18px]">
                                                        <div className="w-[2.5px] h-[2.5px] rounded-full bg-[var(--vapor-color-foreground-hint-darker)] flex-shrink-0"></div>
                                                        <Text
                                                            typography="body3"
                                                            foreground="secondary"
                                                        >
                                                            허브에 공개되어 누구나 접속 할 수
                                                            있습니다.
                                                        </Text>
                                                    </li>
                                                    <li className="flex items-center gap-2 leading-[18px]">
                                                        <div className="w-[2.5px] h-[2.5px] rounded-full bg-[var(--vapor-color-foreground-hint-darker)] flex-shrink-0"></div>
                                                        <Text
                                                            typography="body3"
                                                            foreground="secondary"
                                                        >
                                                            정보 노출에 주의해 주세요.
                                                        </Text>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex px-[var(--vapor-size-space-300)] py-[var(--vapor-size-space-200)] justify-end items-center gap-[var(--vapor-size-space-100)] self-stretch">
                                    <div className="flex h-[40px] p-0 justify-end items-start gap-[var(--vapor-size-space-100)] flex-1">
                                        <Button size="lg" color="secondary">
                                            취소
                                        </Button>
                                        <Button size="lg" color="primary">
                                            <SwitchIcon />
                                            Public으로 변경
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-[371px] h-full p-[var(--vapor-size-space-300)] flex-col items-end flex-shrink-0 bg-[var(--vapor-color-background-normal)] shadow-[0px_16px_32px_0px_rgba(0,0,0,0.20)] max-[991px]:hidden">
                            <div className="w-full h-full flex flex-col gap-[var(--vapor-size-space-300)]">
                                <TextInput.Root
                                    className="w-full relative"
                                    size="lg"
                                    placeholder="이름, 이메일로 검색"
                                    value={searchQuery}
                                    onValueChange={setSearchQuery}
                                >
                                    {/* Since the text input does not belong to any layer, remove !important once it is assigned to a layer. */}
                                    <div className="absolute z-[1] h-full flex items-center justify-center ml-[var(--vapor-size-space-200)]">
                                        <SearchOutlineIcon
                                            size="20"
                                            color="var(--vapor-color-foreground-hint)"
                                        />
                                    </div>
                                    <TextInput.Field className="w-full !pl-[var(--vapor-size-space-500)]" />
                                </TextInput.Root>

                                <div className="w-full flex flex-col items-start gap-[var(--vapor-size-space-200)] self-stretch">
                                    <div className="flex items-start gap-[var(--vapor-size-space-050)]">
                                        <Text typography="subtitle2" foreground="hint-darker">
                                            접속 중
                                        </Text>
                                        <Text typography="subtitle2" foreground="hint-darker">
                                            {filteredActiveUsers.filter((u) => u.online).length}
                                        </Text>
                                    </div>
                                    <UserList users={filteredActiveUsers} />
                                </div>
                                <div className="w-full flex flex-col items-start gap-[var(--vapor-size-space-200)] self-stretch flex-1">
                                    <div className="w-full flex items-start gap-[var(--vapor-size-space-050)]">
                                        <Text typography="subtitle2" foreground="hint-darker">
                                            미접속
                                        </Text>
                                        <Text typography="subtitle2" foreground="hint-darker">
                                            {filteredUnActiveUsers.length}
                                        </Text>
                                    </div>
                                    <UserList users={filteredUnActiveUsers} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LocalThemeProvider>
    );
}
