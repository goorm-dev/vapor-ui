import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ImportIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M8.367 14.66H3.97a1.3 1.3 0 0 1-1.3-1.3V2.631a1.3 1.3 0 0 1 1.3-1.3l4.823.004a1.3 1.3 0 0 1 .917.379l3.247 3.235a1.3 1.3 0 0 1 .383.92v2.134c0 .55-.454.985-.986 1.13a3.75 3.75 0 0 0-2.746 3.865c.05.774-.466 1.662-1.241 1.662M9.7 6h2.6L9 2.7v2.6a.7.7 0 0 0 .7.7"
            clipRule="evenodd"
        />
        <path
            fill="currentColor"
            d="m13.066 13.328.578.577q.2.2.2.472 0 .27-.2.471a.65.65 0 0 1-.472.2.65.65 0 0 1-.47-.2l-1.722-1.72a.65.65 0 0 1-.2-.472q0-.27.2-.471l1.721-1.721q.2-.2.471-.2t.472.2.2.471-.2.472l-.59.589h2.122q.26 0 .454.194a.68.68 0 0 1 .206.466.65.65 0 0 1-.194.477.65.65 0 0 1-.478.195z"
        />
    </IconBase>
);
export default ImportIcon;
