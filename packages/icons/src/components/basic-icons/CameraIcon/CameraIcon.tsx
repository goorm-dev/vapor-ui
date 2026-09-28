import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const CameraIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M8 11.667q1.25 0 2.125-.875A2.9 2.9 0 0 0 11 8.667q0-1.25-.875-2.125A2.9 2.9 0 0 0 8 5.667q-1.25 0-2.125.875A2.9 2.9 0 0 0 5 8.667q0 1.25.875 2.125A2.9 2.9 0 0 0 8 11.667m0-1.334a1.6 1.6 0 0 1-1.183-.483 1.6 1.6 0 0 1-.484-1.183q0-.7.484-1.184A1.6 1.6 0 0 1 8 7q.7 0 1.184.483.483.484.483 1.184 0 .699-.483 1.183A1.6 1.6 0 0 1 8 10.333M2.667 14q-.55 0-.942-.392a1.28 1.28 0 0 1-.392-.941v-8q0-.55.392-.942.391-.392.942-.392h2.1l.833-.9A1.34 1.34 0 0 1 6.584 2h2.833q.284 0 .542.117.258.116.441.316l.833.9h2.1q.55 0 .942.392t.392.942v8q0 .55-.392.941a1.28 1.28 0 0 1-.941.392z"
        />
    </IconBase>
);
export default CameraIcon;
