import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const MicronesiaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-MicronesiaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-MicronesiaColorIcon__a)">
            <path fill="#76B3DE" d="M23.2 0H-7.2v16h30.4z" />
            <path
                fill="#fff"
                d="m7.991 1.85.34 1.04h1.096l-.887.646.338 1.044-.887-.645-.887.645.34-1.044-.888-.645h1.097zm-.881 9.57.888.645.887-.645-.338 1.044.887.645H8.338l-.34 1.042-.338-1.042H6.564l.887-.645zM2.922 6.578l.644.887 1.043-.338-.643.888.643.887-1.043-.34-.644.887V8.353l-1.044-.338 1.044-.339zm10.156-.014-.643.887-1.044-.34.646.887-.646.887 1.044-.338.643.888V8.338l1.044-.34-1.044-.338z"
            />
        </g>
    </IconBase>
);
export default MicronesiaColorIcon;
