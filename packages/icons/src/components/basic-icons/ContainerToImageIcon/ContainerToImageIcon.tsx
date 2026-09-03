import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const ContainerToImageIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M10.454 14.02a6.5 6.5 0 1 1 3.567-3.567 1.213 1.213 0 0 0-2.159.759v.65h-.65a1.213 1.213 0 0 0-.758 2.159M6 8a2 2 0 1 1 4.001.001A2 2 0 0 1 6 8"
            clipRule="evenodd"
        />
        <path
            fill="currentColor"
            d="M13.183 10.704a.52.52 0 0 1 .412.509v1.342h1.342a.52.52 0 0 1 0 1.04h-1.342v1.342a.52.52 0 0 1-1.04 0v-1.342h-1.342a.52.52 0 1 1 0-1.04h1.342v-1.342a.52.52 0 0 1 .628-.509"
        />
    </IconBase>
);
export default ContainerToImageIcon;
