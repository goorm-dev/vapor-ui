'use client';

import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live';

import styles from './live-code-block.module.scss';
import * as VAPOR_CORE from '@vapor-ui/core';
import * as VAPOR_ICONS from '@vapor-ui/icons';
import clsx from 'clsx';

interface LiveCodeBlockProps {
    code: string;
}

const scope = {
    ...VAPOR_CORE,
    ...VAPOR_ICONS,
};

const LiveCodeBlock = ({ code }: LiveCodeBlockProps) => {
    return (
        <div className={clsx(styles.root, 'not-prose')}>
            <LiveProvider code={code} scope={scope}>
                <LivePreview className={styles.preview} />
                <LiveEditor className={styles.editor} />
                <LiveError className={styles.error} />
            </LiveProvider>
        </div>
    );
};

export default LiveCodeBlock;
