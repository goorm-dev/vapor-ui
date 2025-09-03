import { useState } from 'react';

import { Button, RadioGroup, useTheme } from '@vapor-ui/core';
import { ChevronRightOutlineIcon } from '@vapor-ui/icons';
import Link from 'next/link';

import Section from '../section';
import styles from './color-board.module.scss';

const ColorBoard = () => {
    const [value, setValue] = useState<string>('');
    const { setTheme } = useTheme();

    const onChangeColor = (color: string) => {
        setTheme({
            primaryColor: color,
        });
        setValue(color);
    };

    return (
        <div>
            <Section title="Color">
                <RadioGroup.Root
                    value={value}
                    className={styles.colorBoard_radio_group}
                    onValueChange={onChangeColor}
                >
                    <ColorSelector bgColor="#df3337" checkedColor={value} />
                    <ColorSelector bgColor="#da2f74" checkedColor={value} />
                    <ColorSelector bgColor="#be2ce2" checkedColor={value} />
                    <ColorSelector bgColor="#8754f9" checkedColor={value} />
                    <ColorSelector bgColor="#2a6ff3" checkedColor={value} />
                    <ColorSelector bgColor="#0e81a0" checkedColor={value} />
                    <ColorSelector bgColor="#0a8672" checkedColor={value} />
                    <ColorSelector bgColor="#8fd327" checkedColor={value} />
                    <ColorSelector bgColor="#fabb00" checkedColor={value} />
                    <ColorSelector bgColor="#d14905" checkedColor={value} />
                </RadioGroup.Root>
            </Section>
            <Button
                size="md"
                color="secondary"
                variant="outline"
                className={styles.customButton}
                asChild
            >
                <Link href="/docs/getting-started/theming">
                    커스텀 컬러 사용 방법 알아보기
                    <ChevronRightOutlineIcon className={styles.icon} />
                </Link>
            </Button>
        </div>
    );
};

export default ColorBoard;

const ColorSelector = ({ checkedColor, bgColor }: { checkedColor: string; bgColor: string }) => {
    const isChecked = checkedColor === bgColor;

    return (
        <RadioGroup.Item value={bgColor} className={styles.colorSelector}>
            <RadioGroup.Control
                aria-label={bgColor}
                style={
                    !isChecked
                        ? {
                              borderColor: bgColor,
                              backgroundColor: bgColor,
                          }
                        : {}
                }
            />
        </RadioGroup.Item>
    );
};
