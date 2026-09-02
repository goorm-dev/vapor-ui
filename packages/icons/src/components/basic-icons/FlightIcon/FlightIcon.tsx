import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const FlightIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M6.667 9.2 2.45 10.883a.76.76 0 0 1-.758-.075.77.77 0 0 1-.359-.675v-.366a.85.85 0 0 1 .35-.684L6.668 5.6V2.667q0-.55.392-.942.39-.392.941-.392t.942.392.392.942V5.6l4.983 3.483a.85.85 0 0 1 .35.683v.367a.77.77 0 0 1-.358.675.76.76 0 0 1-.759.075L9.334 9.2v2.4l1.716 1.2a.7.7 0 0 1 .208.242q.076.141.076.308v.4a.65.65 0 0 1-.275.542.65.65 0 0 1-.609.108L8 13.667l-2.45.733a.65.65 0 0 1-.608-.108.65.65 0 0 1-.275-.542v-.4q0-.167.075-.308a.7.7 0 0 1 .208-.242l1.717-1.2z"
        />
    </IconBase>
);
export default FlightIcon;
