import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const GrenadaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-GrenadaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-GrenadaColorIcon__a)">
            <path fill="#CF0921" d="M21.335 0H-5.334v16h26.667z" />
            <path
                fill="#FCD20F"
                d="m7.947 8.04 11.104-5.878H-3.156zm-11.103 5.878H19.05L7.947 8.04z"
            />
            <path
                fill="#007B5E"
                d="M-3.156 13.918 7.947 8.04-3.156 2.162zm22.206 0V2.162L7.948 8.04z"
            />
            <path
                fill="#FCD20F"
                d="M2.909.825 2.675.1 2.44.825h-.756l.612.45L2.062 2l.613-.449.612.449-.234-.725.612-.45zm5.304 0L7.98.1l-.235.725H6.99l.613.45L7.367 2l.613-.449.613.449-.235-.725.613-.45zm5.305 0L13.286.1l-.235.725h-.757l.611.45-.232.725.613-.449.61.449-.232-.725.612-.45zM2.909 14.593l-.234-.727-.235.727h-.756l.612.447-.234.727.613-.449.612.45-.234-.728.612-.447zm5.304 0-.233-.727-.235.727H6.99l.613.447-.235.727.613-.449.613.45-.235-.728.613-.447zm5.305 0-.232-.727-.235.727h-.757l.611.447-.232.727.613-.449.61.45-.232-.728.612-.447z"
            />
            <path
                fill="#CF0921"
                d="M8 9.998c1.07 0 1.936-.874 1.936-1.953A1.945 1.945 0 0 0 8 6.093c-1.07 0-1.936.874-1.936 1.952 0 1.079.867 1.953 1.936 1.953"
            />
            <path
                fill="#FCD20F"
                d="M8.396 7.62 8 6.393 7.604 7.62H6.322l1.038.76-.396 1.227L8 8.85l1.036.758L8.64 8.38l1.038-.76z"
            />
        </g>
    </IconBase>
);
export default GrenadaColorIcon;
