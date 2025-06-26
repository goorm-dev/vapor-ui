'use client';

import styles from './foundation-card.module.scss';
import { Card, Text } from '@vapor-ui/core';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

interface FoundationCardProps {
    title: string;
    description: string;
    imageUrl: string;
    href: string;
}

const FoundationCard = ({ title, description, imageUrl, href }: FoundationCardProps) => {
    return (
        <Card className={clsx(styles.card)}>
            <Link href={href}>
                <Card.Header className={styles.header}>
                    <Image
                        src={imageUrl}
                        alt={`${title} 이미지`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                </Card.Header>
                <Card.Body className={styles.body}>
                    <Text typography="heading5">{title}</Text>
                    <Text typography="body2">{description}</Text>
                </Card.Body>
            </Link>
        </Card>
    );
};

export default FoundationCard;
