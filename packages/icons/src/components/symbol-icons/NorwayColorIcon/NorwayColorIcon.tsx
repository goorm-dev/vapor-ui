import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const NorwayColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-NorwayColorIcon__a"
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
        <g mask="url(#vapor-icons-color-NorwayColorIcon__a)">
            <path
                fill="#BA0C2F"
                d="M5.13 0H-.85v6.018h5.98zm0 9.982H-.85V16h5.98zM21.15 0H9.139v6.018h12.013zm0 9.982H9.139V16h12.013z"
            />
            <path
                fill="#fff"
                d="M9.138 0h-.98v6.976h12.993v-.958H9.138zm-.98 9.002V16h.98V9.982h12.013v-.98zm-2.048 0H-.85v.98h5.98V16h.98zm0-2.026V0h-.98v6.018H-.85v.958z"
            />
            <path
                fill="#00205B"
                d="M8.158 6.976V0H6.11v6.976H-.849v2.026h6.958V16h2.05V9.002H21.15V6.976z"
            />
        </g>
    </IconBase>
);
export default NorwayColorIcon;
