import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const DjiboutiColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-DjiboutiColorIcon__a"
            width={16}
            height={16}
            x={0}
            y={0}
            maskUnits="userSpaceOnUse"
            style={{
                maskType: 'luminance',
            }}
        >
            <path fill="#fff" d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
        </mask>
        <g mask="url(#vapor-icons-color-DjiboutiColorIcon__a)">
            <path fill="#fff" d="M-2.44 15.905V.091h23.818v15.818z" />
            <path
                fill="#F2F2F0"
                d="M-2.53 8v8l.006-.004L21.47 16V0h-24zm.181 0V.182h23.636v15.636l-23.636-.003z"
            />
            <path fill="#12AD2B" d="M21.469 8h-10.14l-13.853 7.996V16h24V8z" />
            <path fill="#6AB2E7" d="M21.47 8V0h-24l13.86 8z" />
            <path
                fill="#D7141A"
                fillRule="evenodd"
                d="m2.773 6.047.485 1.495h1.571l-1.271.923.485 1.495-1.27-.924-1.271.924.485-1.495-1.273-.923h1.573z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default DjiboutiColorIcon;
