import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const VenezuelaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-VenezuelaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-VenezuelaColorIcon__a)">
            <path fill="#FC0" d="M20 0H-4v5.307h24z" />
            <path fill="#CF012B" d="M20 10.693H-4V16h24z" />
            <path fill="#00247D" d="M20 5.307H-4v5.384h24z" />
            <path
                fill="#fff"
                d="m7.284 6.225-.231-.432-.068.485-.483.086.44.216-.067.485.34-.352.441.214-.23-.432.341-.355zm-1.239.317-.427.238-.358-.333.095.48-.428.238.488.059.094.48.206-.444.485.058-.358-.333zm-1.485.956-.318.371-.453-.187.255.416-.319.373.477-.115.254.419.04-.488.477-.114-.453-.188zM3.618 9.34l-.15-.467-.152.467h-.49l.396.29-.151.466.396-.289.397.29-.151-.468.398-.289zm5.398-3.062-.069-.485-.23.432-.484-.085.342.355-.231.432.441-.214.34.352-.067-.485.442-.216zm1.724.169-.358.333-.427-.238.205.443-.36.333.485-.058.206.444.094-.48.488-.059-.428-.238zm1.47 1.235-.45.187-.32-.37.04.486-.453.188.477.114.04.488.254-.419.476.115-.318-.373zm.476 1.658-.153-.467-.151.467h-.491l.396.29-.15.466.396-.289.398.29-.153-.468.398-.289z"
            />
        </g>
    </IconBase>
);
export default VenezuelaColorIcon;
