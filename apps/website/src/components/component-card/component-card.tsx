'use client';

import { Badge, Card, Text } from '@vapor-ui/core';
import cn from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

import styles from './component-card.module.scss';

type ComponentCardType = {
    imageUrl: string;
    alt: string;
    name: string;
    description: string;
    href?: string;
    componentType?: string;
};
const CardWrapper = ({
    imageUrl,
    alt = 'alert',
    name,
    description,
    componentType,
}: ComponentCardType) => {
    return (
        <>
            <Card.Header className={styles.header}>
                <Image
                    className={styles.image}
                    src={imageUrl}
                    alt={alt}
                    width={500}
                    height={300}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    priority
                />
            </Card.Header>
            <Card.Body className={styles.body}>
                <div className={styles.componentName}>
                    <Text typography="heading5">{name}</Text>
                    {componentType && (
                        <Badge color="primary" size="md" shape="pill" className="gap-7">
                            {componentType}
                        </Badge>
                    )}
                </div>
                <Text typography="body2" foreground="secondary" className={styles.description}>
                    {description}
                </Text>
            </Card.Body>
        </>
    );
};
const ComponentsCard = (props: ComponentCardType) => {
    const { href } = props;

    if (href) {
        return (
            <Card.Root className={cn(styles.card, styles.link)}>
                <Link href={href}>
                    <CardWrapper {...props} />
                </Link>
            </Card.Root>
        );
    }
    return (
        <Card.Root className={styles.card}>
            <CardWrapper {...props} />
        </Card.Root>
    );
};

export default ComponentsCard;
