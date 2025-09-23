'use client';

import { Badge, Card, Text } from '@vapor-ui/core';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

export type BlockCardProps = {
    id: string;
    name: string;
    description: string;
    href?: string;
    imageUrl?: string;
    isComingSoon?: boolean;
};

const ComingSoonContent = ({ name, description }: { name: string; description: string }) => (
    <>
        <Card.Header className="p-0 overflow-hidden relative flex items-center justify-center aspect-[5/3] bg-v-normal-darker">
            <Badge color="contrast" size="lg" shape="pill">
                Coming Soon
            </Badge>
        </Card.Header>
        <Card.Body className="p-[var(--vapor-size-space-300)] min-h-[120px] flex flex-col justify-between">
            <div className="flex flex-col gap-[var(--vapor-size-space-150)]">
                <Text typography="heading5" className="font-semibold">
                    {name}
                </Text>
                <Text typography="body2" foreground="secondary" className="leading-6 line-clamp-2">
                    {description}
                </Text>
            </div>
        </Card.Body>
    </>
);

const RegularContent = ({
    name,
    description,
    imageUrl,
}: {
    name: string;
    description: string;
    imageUrl: string;
}) => (
    <>
        <Card.Header className="p-0 overflow-hidden aspect-[5/3]">
            <Image
                className="w-full h-full object-cover block transition-transform duration-200 ease-in-out group-hover:scale-105"
                src={imageUrl}
                alt={`${name} block preview`}
                width={500}
                height={300}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                priority
            />
        </Card.Header>
        <Card.Body className="p-[var(--vapor-size-space-300)] min-h-[120px] flex flex-col justify-between">
            <div className="flex flex-col gap-[var(--vapor-size-space-150)]">
                <Text typography="heading5" className="font-semibold">
                    {name}
                </Text>
                <Text typography="body2" foreground="secondary" className="leading-6 line-clamp-2">
                    {description}
                </Text>
            </div>
        </Card.Body>
    </>
);

export const BlockCard = ({
    id,
    name,
    description,
    href,
    imageUrl,
    isComingSoon = false,
}: BlockCardProps) => {
    const cardContent = isComingSoon ? (
        <ComingSoonContent name={name} description={description} />
    ) : (
        <RegularContent name={name} description={description} imageUrl={imageUrl!} />
    );

    const cardClasses = clsx(
        'overflow-hidden transition-all duration-200 ease-in-out',
        'rounded-[var(--vapor-size-borderRadius-300)]',
        !isComingSoon &&
            'cursor-pointer group hover:-translate-y-0.5 hover:shadow-[var(--vapor-effect-shadow-300)]',
    );

    if (isComingSoon || !href) {
        return (
            <Card.Root className={cardClasses} data-block-id={id}>
                {cardContent}
            </Card.Root>
        );
    }

    return (
        <Card.Root className={cardClasses} data-block-id={id}>
            <Link href={href} className="text-inherit no-underline block h-full">
                {cardContent}
            </Link>
        </Card.Root>
    );
};
