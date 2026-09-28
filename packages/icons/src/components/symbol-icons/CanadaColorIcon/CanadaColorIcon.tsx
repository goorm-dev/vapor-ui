import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const CanadaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-CanadaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-CanadaColorIcon__a)">
            <path fill="#D62718" d="M2.333 0h-5.491v16h5.49zm16.823 0h-5.49v16h5.49z" />
            <path fill="#fff" d="M13.666 0H2.335v16h11.33z" />
            <path
                fill="#D62718"
                fillRule="evenodd"
                d="m4.144 7.884-.471.227 2.17 1.79a.16.16 0 0 1 .05.175l-.255.722 2.031-.334a.187.187 0 0 1 .216.192l-.094 2.04h.418l-.094-2.04a.187.187 0 0 1 .216-.192l2.03.334-.254-.722a.16.16 0 0 1 .05-.174l2.17-1.791-.47-.227a.17.17 0 0 1-.088-.206l.431-1.29-1.236.261a.174.174 0 0 1-.195-.098l-.256-.571-.993 1.045c-.098.104-.27.015-.244-.125l.468-2.456-.719.434a.18.18 0 0 1-.254-.073l-.773-1.503-.773 1.503a.18.18 0 0 1-.254.073l-.718-.434L6.72 6.9c.027.14-.145.227-.244.125L5.484 5.98l-.257.57a.17.17 0 0 1-.194.1l-1.237-.263.431 1.291c.028.08-.01.17-.087.206z"
                clipRule="evenodd"
            />
        </g>
    </IconBase>
);
export default CanadaColorIcon;
