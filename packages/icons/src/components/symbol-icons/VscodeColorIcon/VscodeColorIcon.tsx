import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const VscodeColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="#0065A9"
            d="m14.548 2.483-2.9-1.396a.88.88 0 0 0-1 .17L1.156 9.912a.586.586 0 0 0 0 .867l.776.705c.209.19.523.204.748.033l11.431-8.672a.582.582 0 0 1 .934.464v-.033a.88.88 0 0 0-.498-.793"
        />
        <path
            fill="#007ACC"
            d="m14.548 13.517-2.9 1.396a.88.88 0 0 1-1-.17L1.156 6.09a.586.586 0 0 1 0-.868l.776-.705a.586.586 0 0 1 .748-.033l11.431 8.672c.384.29.934.017.934-.464v.034a.88.88 0 0 1-.498.792"
        />
        <path
            fill="#1F9CF0"
            d="M11.648 14.913a.88.88 0 0 1-1-.17c.324.325.88.095.88-.364V1.62a.515.515 0 0 0-.88-.364.88.88 0 0 1 1-.17l2.9 1.394a.88.88 0 0 1 .498.792v9.454a.88.88 0 0 1-.499.792z"
        />
        <path
            fill="url(#vapor-icons-color-VscodeColorIcon__a)"
            fillRule="evenodd"
            d="M10.944 14.94a.87.87 0 0 0 .697-.026l2.898-1.395a.88.88 0 0 0 .498-.792V3.274a.88.88 0 0 0-.498-.793l-2.897-1.394a.88.88 0 0 0-1 .17l-5.547 5.06L2.68 4.483a.586.586 0 0 0-.748.034l-.775.704a.587.587 0 0 0 0 .868L3.25 8 1.156 9.912a.587.587 0 0 0 0 .867l.775.705c.209.19.523.204.748.033l2.416-1.834 5.547 5.06q.133.132.302.197m.577-10.134L7.312 8l4.209 3.195z"
            clipRule="evenodd"
            opacity={0.25}
            style={{
                mixBlendMode: 'overlay',
            }}
        />
        <defs>
            <linearGradient
                id="vapor-icons-color-VscodeColorIcon__a"
                x1={8.001}
                x2={8.001}
                y1={1}
                y2={15}
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="#fff" />
                <stop offset={1} stopColor="#fff" stopOpacity={0} />
            </linearGradient>
        </defs>
    </IconBase>
);
export default VscodeColorIcon;
