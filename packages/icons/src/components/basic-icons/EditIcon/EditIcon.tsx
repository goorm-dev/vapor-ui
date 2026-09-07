import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const EditIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M2.667 14a.65.65 0 0 1-.475-.192.65.65 0 0 1-.192-.475v-1.616a1.32 1.32 0 0 1 .383-.934l8.417-8.4q.2-.183.442-.283.24-.1.508-.1.267 0 .517.1.249.1.433.3l.917.933q.2.184.291.434a1.44 1.44 0 0 1 0 1.008 1.25 1.25 0 0 1-.291.442l-8.4 8.4a1.32 1.32 0 0 1-.933.383zm9.066-8.8.934-.933-.934-.934-.933.934z"
        />
    </IconBase>
);
export default EditIcon;
