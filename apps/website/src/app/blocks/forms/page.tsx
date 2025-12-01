'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SiteNavBar } from '~/components/site-nav-bar/site-nav-bar';

const BUILT_IN_FORMS = [
    {
        id: 'built-in',
        name: '내장 폼 예제',
        description: 'Vapor UI의 내장 폼 컴포넌트를 사용한 예제들입니다.',
        imageUrl: '/icons/logo-vapor.svg',
        href: '/blocks/forms/built-in',
    },
    {
        id: 'tanstack-form',
        name: 'TanStack Form 예제',
        description: 'TanStack Form을 사용한 폼 예제들입니다.',
        imageUrl: '/images/forms/tanstack-form.svg',
        href: '/blocks/forms/tanstack-form',
    },
    {
        id: 'react-hook-form',
        name: 'React Hook Form 예제',
        description: 'React Hook Form을 사용한 폼 예제들입니다.',
        imageUrl: '/images/forms/react-hook-form.svg',
        href: '/blocks/forms/react-hook-form',
    },
];

export default function FormList() {
    return (
        <div>
            <SiteNavBar />
            <main className="pt-[62px]">
                <div className="flex flex-col py-[100px] px-[146px] gap-[100px] max-lg:pt-[var(--vapor-size-space-900)] max-lg:px-[var(--vapor-size-space-400)] max-lg:gap-[var(--vapor-size-space-900)] max-sm:py-[var(--vapor-size-space-800)] max-sm:gap-[var(--vapor-size-space-400)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--vapor-size-space-400)] [&>*]:min-h-[263px]">
                        {BUILT_IN_FORMS.map((block) => (
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
