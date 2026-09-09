import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ChapterIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M4 14.667q-.55 0-.942-.392a1.28 1.28 0 0 1-.391-.942V2.667q0-.55.391-.942.392-.392.942-.392h8q.55 0 .941.392.393.392.392.942v10.666q0 .55-.392.942a1.28 1.28 0 0 1-.941.392zm3.333-12V6.75q0 .2.159.292.158.09.341-.009l.817-.483a.66.66 0 0 1 .341-.1q.176 0 .342.1l.817.483q.183.1.35.009a.31.31 0 0 0 .166-.292V2.667z"
        />
    </IconBase>
);
export default ChapterIcon;
