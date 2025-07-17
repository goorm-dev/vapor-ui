import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { Badge, Button, Card, Text } from '@vapor-ui/core';
import { ConfirmOutlineIcon } from '@vapor-ui/icons';
import cn from 'classnames';

import ColorBoard from '../color-board';
import Mode from '../mode';
import Radius from '../radius';
import Scaling from '../scaling';
import styles from './theme-panel.module.scss';

// import Section from '../section';
// import FontInput from '../FontInput/FontInput';

const ThemePanel = () => {
    const [open, setOpen] = useState(true);
    const [isCopied, setIsCopied] = useState(false);

    const onClickCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 3000);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const nodes = e.currentTarget.querySelectorAll(
            'button[role="radio"][aria-checked=true]',
        ) satisfies NodeListOf<HTMLButtonElement>;

        const providerTemplate = parseThemes(nodes);
        onClickCopy(providerTemplate);
    };

    useEffect(() => {
        const clickV = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey) return;
            if (e.key === 'v' || e.key === 'ㅍ') setOpen((prev) => !prev);
        };

        document.addEventListener('keydown', clickV);
        return () => document.removeEventListener('keydown', clickV);
    }, []);

    return (
        <Card.Root
            className={cn(styles.panel, 'vapor-core', {
                [styles.panel_open]: open,
            })}
            data-vapor-scaling="1"
        >
            <Card.Header className={styles.panel_header}>
                <Text typography="heading5">Theme Setting</Text>

                <div className={styles['panel_hot-key']}>
                    <Badge color="hint">V</Badge>
                    <Text typography="subtitle2" color="foreground-hint">
                        로 열기/닫기
                    </Text>
                </div>
            </Card.Header>

            <Card.Body className={styles.panel_body}>
                <form id="theme-panel" className={styles.sections} onSubmit={handleSubmit}>
                    <ColorBoard />
                    <Mode />
                    <Radius />
                    <Scaling />
                    {/*<Section title="Font">
                        <FontInput />
                    </Section> */}
                </form>
            </Card.Body>

            <Card.Footer>
                <Button stretch type="submit" form="theme-panel">
                    {/* onClick={onClickCopy} */}
                    {isCopied ? <ConfirmOutlineIcon /> : 'Copy Theme'}
                </Button>
            </Card.Footer>
        </Card.Root>
    );
};

export default ThemePanel;

function parseThemes(nodes: NodeListOf<HTMLButtonElement>) {
    let attributes = '';

    nodes.forEach((node) => {
        const category = node.getAttribute('data-theme-category');
        if (category === 'border-radius') {
            attributes += `borderRadiusFactor="${node.value}" `;
        } else {
            attributes += `${category}="${node.value}" `;
        }
    });

    return `createThemeConfig({
	primaryColor: "${attributes}",
});`;
}
