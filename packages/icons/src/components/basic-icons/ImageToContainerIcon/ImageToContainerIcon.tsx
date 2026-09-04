import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ImageToContainerIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M3.333 14q-.55 0-.941-.392A1.28 1.28 0 0 1 2 12.667V3.333q0-.55.392-.941Q2.783 2 3.333 2h9.334q.55 0 .941.392.392.391.392.941v7.19a1.213 1.213 0 0 0-1.838 1.04v.65h-.65A1.213 1.213 0 0 0 10.446 14zM8.7 4.675a.675.675 0 0 0-1.35 0v6.65a.675.675 0 1 0 1.35 0zM11.125 4c.373 0 .675.302.675.675v6.65a.675.675 0 1 1-1.35 0v-6.65c0-.373.303-.675.675-.675M5.6 4.675a.675.675 0 0 0-1.35 0v6.65a.675.675 0 1 0 1.35 0z"
            clipRule="evenodd"
        />
        <path
            fill="currentColor"
            d="M13.895 12.905h1.343a.52.52 0 1 1 0 1.04h-1.343v1.342a.52.52 0 0 1-1.04 0v-1.342h-1.342a.52.52 0 1 1 0-1.04h1.342v-1.342a.52.52 0 1 1 1.04 0z"
        />
    </IconBase>
);
export default ImageToContainerIcon;
