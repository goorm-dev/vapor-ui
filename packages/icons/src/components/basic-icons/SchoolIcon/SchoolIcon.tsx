import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SchoolIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M11.33 1.5q.283 0 .475.191a.65.65 0 0 1 .192.476V3.5a.65.65 0 0 1-.192.475.65.65 0 0 1-.475.192H8.663v.616q.05.03.1.067l5.55 3.9a.81.81 0 0 1 .35.667q0 .383-.258.642a.87.87 0 0 1-.641.257h-.434v3h1.333v1.334H1.33v-1.334h1.333v-3H2.23a.86.86 0 0 1-.641-.266.9.9 0 0 1-.259-.65.75.75 0 0 1 .092-.367.84.84 0 0 1 .258-.283l5.55-3.9q.05-.036.1-.067V2.167q0-.284.191-.476a.65.65 0 0 1 .476-.191zm-3.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
        />
    </IconBase>
);
export default SchoolIcon;
