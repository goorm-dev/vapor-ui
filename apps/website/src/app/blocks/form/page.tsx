'use client';

import { Badge, Text } from '@vapor-ui/core';
import Image from 'next/image';
import Link from 'next/link';
import { SiteNavBar } from '~/components/site-nav-bar/site-nav-bar';

const FORM_FRAMEWORK = [
    {
        id: 'built-in',
        name: '내장 폼 예제',
        description: 'Vapor UI의 내장 폼 컴포넌트를 사용한 예제들입니다.',
        imageUrl: '/icons/logo-vapor.svg',
        href: '/blocks/form/built-in',
    },
    {
        id: 'tanstack-form',
        name: 'TanStack Form 예제',
        description: 'TanStack Form을 사용한 폼 예제들입니다.',
        imageUrl: '/images/form/tanstack-form.svg',
        href: '/blocks/form/tanstack-form',
    },
    {
        id: 'react-hook-form',
        name: 'React Hook Form 예제',
        description: 'React Hook Form을 사용한 폼 예제들입니다.',
        imageUrl: '/images/form/react-hook-form.svg',
        href: '/blocks/form/react-hook-form',
    },
];

export default function FormList() {
    return (
        <div>
            <SiteNavBar />
            <main className="pt-[62px]">
                <div className="flex flex-col py-[100px] px-[146px] gap-[50px] max-lg:pt-[var(--vapor-size-space-900)] max-lg:px-[var(--vapor-size-space-400)] max-lg:gap-[var(--vapor-size-space-900)] max-sm:py-[var(--vapor-size-space-800)] max-sm:gap-[var(--vapor-size-space-400)]">
                    <div className="flex flex-col gap-[var(--vapor-size-space-300)]">
                        <Badge colorPalette="hint" shape="pill" size="lg" className="flex-0">
                            Form
                        </Badge>
                        <Text typography="body1" foreground="normal-100">
                            Form 프레임워크를 선택하여 다양한 폼 예제들을 확인해보세요.
                        </Text>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--vapor-size-space-400)] [&>*]:min-h-[263px]">
                        {FORM_FRAMEWORK.map((block) => (
                            <Link
                                key={block.id}
                                href={block.href}
                                className="group no-underline"
                            >
                                <div className="border border-v-border-dark rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out h-full flex flex-col">
                                    <div className="p-0 overflow-hidden aspect-[5/3]">
                                        <Image
                                            className="w-full h-full object-contain block transition-transform duration-200 ease-in-out group-hover:scale-105"
                                            src={block.imageUrl}
                                            alt={`${block.name} block preview`}
                                            width={500}
                                            height={300}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                    <div className="p-[var(--vapor-size-space-300)] min-h-[120px] flex flex-col justify-between">
                                        <div className="flex flex-col gap-[var(--vapor-size-space-150)]">
                                            <h3 className="typography-heading5 text-v-foreground-normal-100">
                                                {block.name}
                                            </h3>
                                            <p className="typography-body2 text-v-foreground-normal-200">
                                                {block.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
