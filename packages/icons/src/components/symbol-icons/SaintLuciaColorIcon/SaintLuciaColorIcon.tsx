import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SaintLuciaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-SaintLuciaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-SaintLuciaColorIcon__a)">
            <path fill="#66CDFF" d="M24 0H-8v16h32z" />
            <path
                fill="#fff"
                fillRule="evenodd"
                d="M2.704 14.636h10.592L8 1.476z"
                clipRule="evenodd"
            />
            <path
                fill="#000"
                fillRule="evenodd"
                d="M3.369 14.636h9.262L8 3.251z"
                clipRule="evenodd"
            />
            <path
                fill="#FCD20F"
                fillRule="evenodd"
                d="M2.704 14.636h10.592L8 8.056z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default SaintLuciaColorIcon;
