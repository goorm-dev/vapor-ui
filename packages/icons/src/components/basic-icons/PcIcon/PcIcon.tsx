import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const PcIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M2.8 12q-.5 0-.85-.35a1.16 1.16 0 0 1-.35-.85V3.6q0-.5.35-.85t.85-.35h10.4q.5 0 .85.35t.35.85v7.2q0 .5-.35.85t-.85.35h-2.8l.617.617q.083.083.133.191a.6.6 0 0 1 .05.242.53.53 0 0 1-.158.392.53.53 0 0 1-.392.158h-5.3a.53.53 0 0 1-.392-.158.53.53 0 0 1-.158-.392.6.6 0 0 1 .05-.242.7.7 0 0 1 .133-.191L5.6 12z"
        />
    </IconBase>
);
export default PcIcon;
