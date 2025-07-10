import { useState } from 'react';

import styles from './FontInput.module.scss';
import { Button, Text, TextInput } from '@goorm-dev/vapor-core';

const FontInput = () => {
    const [fontUrl, setFontUrl] = useState('');
    // https://fonts.gstatic.com/s/roboto/v47/KFO5CnqEu92Fr1Mu53ZEC9_Vu3r1gIhOszmkC3kaSTbQWt4N.woff2

    const handleButtonClick = async () => {
        const font = new FontFace('Vapor Font', `url(${fontUrl})`);
        await font.load();
        document.fonts.add(font);
        document.fonts.ready.then(() => {
            const target = document.getElementsByTagName('article')[0];
            target.style.fontFamily = 'Vapor Font';
        });
    };

    return (
        <div className={styles.textInput_wrapper}>
            <div className={styles.textInput_innerWrapper}>
                <TextInput
                    type="text"
                    value={fontUrl}
                    onValueChange={(value) => setFontUrl(value as string)}
                >
                    <TextInput.Field placeholder="폰트 URL 입력" className={styles.input} />
                </TextInput>
                <Button
                    type="button"
                    id="Font-Apply-Test"
                    shape="outline"
                    onClick={handleButtonClick}
                    className={styles.applyButton}
                >
                    적용
                </Button>
            </div>
            <Text typography="body2" color="foreground-hint">
                ex) https://example.com/font.woff2
            </Text>
        </div>
    );
};

export default FontInput;
