'use client';

import React from 'react';
import type { ReactNode } from 'react';

import { Button, Card, Text } from '@vapor-ui/core';
import { ForwardPageOutlineIcon } from '@vapor-ui/icons';
import Link from 'next/link';

const IntroLinkCard = ({
    icon,
    title,
    description,
    link,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    link: string;
}) => {
    return (
        <Card.Root>
            <Card.Body>
                <div className="flex flex-col items-start gap-[var(--vapor-size-space-250)] self-stretch">
                    <div className="flex flex-col items-start gap-[var(--vapor-size-space-200)] self-stretch">
                        {icon}
                        <div className="flex flex-col items-start gap-[var(--vapor-size-space-100)] self-stretch">
                            <Text typography="heading4" foreground="normal">
                                {title}
                            </Text>
                            <Text typography="body1" foreground="normal" className="min-h-12">
                                {description}
                            </Text>
                        </div>
                    </div>
                    <Button size="lg" color="secondary" asChild>
                        <Link href={link}>
                            Learn more <ForwardPageOutlineIcon size={20} />
                        </Link>
                    </Button>
                </div>
            </Card.Body>
        </Card.Root>
    );
};

export default IntroLinkCard;
