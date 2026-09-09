import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const AirplayIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M5.2 14a.45.45 0 0 1-.367-.158.52.52 0 0 1-.133-.342q0-.084.034-.175a.5.5 0 0 1 .116-.175l2.684-2.683a.63.63 0 0 1 .467-.2.63.63 0 0 1 .466.2l2.683 2.683a.48.48 0 0 1 .15.35.52.52 0 0 1-.133.342.45.45 0 0 1-.367.158zM2.667 2h10.667q.55 0 .941.392.392.391.392.941v8q0 .55-.392.942a1.28 1.28 0 0 1-.941.392h-.117a1.32 1.32 0 0 1-.934-.384L9.418 9.417A2 2 0 0 0 8 8.834a2 2 0 0 0-1.416.583l-2.867 2.866a1.32 1.32 0 0 1-.933.383h-.117q-.55 0-.942-.391a1.28 1.28 0 0 1-.392-.942v-8q0-.55.392-.941Q2.116 2 2.667 2"
        />
    </IconBase>
);
export default AirplayIcon;
