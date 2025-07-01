'use client';

import styles from './page.module.scss';
import { Badge, Button, Text, TextInput } from '@vapor-ui/core';
import { ForwardPageOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
    return (
        <main
            className={clsx(
                styles.main,
                'flex flex-col items-center gap-10 self-stretch flex-1 justify-center text-center',
            )}
        >
            <Image
                className={styles.banner}
                src="https://statics.goorm.io/gds/docs/main/vapor-index-banner.png" // TODO: 이미지 s3에 올려서 사용할 것
                alt="" // banner와 같이 단순 시각 효과를 위한 이미지는 대체 텍스트를 사용하지 않는다.
                width="1440"
                height="572"
                priority
            />

            <div className="flex flex-col items-center gap-4 self-stretch">
                <div className="flex flex-col items-center gap-10 self-stretch">
                    <div className="flex flex-col items-center gap-4 self-stretch">
                        <div className="flex flex-col items-center gap-[4px] self-stretch">
                            <Badge size="md" color="hint" shape="pill">
                                구름 디자인 시스템 3.0
                            </Badge>

                            <Text typography="heading1" foreground="normal" asChild>
                                <h1>
                                    Kickstart your project
                                    <br />
                                    with our UI Kit.
                                </h1>
                            </Text>
                        </div>

                        <Text typography="body1" foreground="normal">
                            Vapor는 디자이너와 개발자가 함께 사용할 수 있는 통일된 디자인 언어와
                            구성 요소를 제공하여 <br />
                            생산성을 높이고 사용자 경험을 개선하는 것을 목표로 합니다.
                        </Text>
                    </div>
                    <div
                        className="flex flex-col items-center gap-4"
                        style={{
                            maxWidth: '720px',
                            width: '100%',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            background:
                                'linear-gradient(90deg, var(--basic-color-blue-blue-300, rgba(35, 115, 235, 0.08)) 0%, var(--basic-color-blue-blue-800, rgba(208, 227, 254, 0.08)) 100%), var(--semantic-color-background-background-normal, #23272E)',
                            boxShadow: '0px 4px 48px 0px rgba(115, 143, 255, 0.32)',
                        }}
                    >
                        <TextInput size="xl" className="w-full">
                            <TextInput.Field className="w-full" />
                        </TextInput>
                    </div>
                </div>

                <Button size="xl" color="secondary" className={styles.gradientButton} asChild>
                    <Link href="/docs">
                        Docs 보러 가기
                        <ForwardPageOutlineIcon width="24" height="24" color="var(--text-normal)" />
                    </Link>
                </Button>
            </div>
        </main>
    );
}
