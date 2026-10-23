import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const StruckOutlineIcon = (props: IconProps) => (
    <IconBase
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        fill="none"
        viewBox="0 0 16 16"
        {...props}
    >
        <use xlinkHref="#vapor-icons-mono-StruckOutlineIcon__a" fill="currentColor" />
        <mask
            id="vapor-icons-mono-StruckOutlineIcon__b"
            width={14}
            height={14}
            x={1}
            y={0.65}
            fill="currentColor"
            maskUnits="userSpaceOnUse"
        >
            <path fill="#fff" d="M1 .65h14v14H1z" />
            <use xlinkHref="#vapor-icons-mono-StruckOutlineIcon__a" />
        </mask>
        <path
            stroke="currentColor"
            strokeWidth={0.6}
            d="M8 4.85a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Zm2-1.2a2 2 0 0 1-1.6 1.96v2.54l2.193 2.194a.8.8 0 0 1 .207-.027h2.4a.8.8 0 0 1 .8.8v2.4a.8.8 0 0 1-.8.8h-2.4a.8.8 0 0 1-.8-.8v-2.4a.8.8 0 0 1 .027-.208L7.994 8.876l-2.045 1.958a.8.8 0 0 1 .051.283v2.4a.8.8 0 0 1-.8.8H2.8a.8.8 0 0 1-.8-.8v-2.4a.8.8 0 0 1 .8-.8h2.4q.063 0 .122.009L7.6 8.146V5.61A2 2 0 1 1 10 3.65Zm-7.2 7.467h2.4v2.4H2.8zm10.4 0h-2.4v2.4h2.4z"
            mask="url(#vapor-icons-mono-StruckOutlineIcon__b)"
        />
        <defs>
            <path
                id="vapor-icons-mono-StruckOutlineIcon__a"
                fillRule="evenodd"
                d="M8.4 5.61a2 2 0 1 0-.8 0v2.536l-2.278 2.18a1 1 0 0 0-.122-.01H2.8a.8.8 0 0 0-.8.8v2.4a.8.8 0 0 0 .8.8h2.4a.8.8 0 0 0 .8-.8v-2.4q0-.15-.051-.282l2.045-1.958 2.033 2.033a.8.8 0 0 0-.027.208v2.4a.8.8 0 0 0 .8.8h2.4a.8.8 0 0 0 .8-.8v-2.4a.8.8 0 0 0-.8-.8h-2.4a.8.8 0 0 0-.207.027L8.4 8.15zm.8-1.96a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0m-4 7.467H2.8v2.4h2.4zm5.6 0h2.4v2.4h-2.4z"
                clipRule="evenodd"
            />
        </defs>
    </IconBase>
);
export default StruckOutlineIcon;
