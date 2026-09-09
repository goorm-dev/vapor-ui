import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const NepalColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-NepalColorIcon__a"
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
        <g mask="url(#vapor-icons-color-NepalColorIcon__a)">
            <path fill="#003594" d="M6.307 8.258 14.04 16H1.496V0l13.01 8.213z" />
            <path fill="#DD0C39" d="M1.955 15.515V.886L12.88 7.735H5.11l7.794 7.78z" />
            <path
                fill="#fff"
                d="m4.71 9.364.408.763.738-.456-.027.867.867-.027-.458.736.766.41-.766.41.458.737-.867-.028.027.868-.738-.457-.409.764-.41-.764-.737.457.027-.868-.867.028.458-.737-.765-.41.765-.41-.458-.736.867.027-.027-.867.736.456zm.252-4.571.102.465.41-.245-.056.462.435-.055-.21.385.45.108-.378.26.318.283-.526.091.204.431-.456-.145-.35.158-.383.004-.353-.151L3.716 7l.193-.436-.56-.048.344-.32-.38-.26.45-.118-.234-.373.458.042-.09-.458.41.233.097-.462.283.384z"
            />
            <path
                fill="#fff"
                d="M4.696 6.693a2.34 2.34 0 0 1-2.174-1.478A2.176 2.176 0 0 0 4.696 7.38c1.197 0 2.17-.97 2.175-2.165a2.34 2.34 0 0 1-2.175 1.478"
            />
        </g>
    </IconBase>
);
export default NepalColorIcon;
