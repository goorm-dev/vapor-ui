import IconBase from '~/components/icon-base';
import type { IconProps } from '~/components/icon-base';

const SamoaColorIcon = (props: IconProps) => (
    <IconBase xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <mask
            id="vapor-icons-color-SamoaColorIcon__a"
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
        <g mask="url(#vapor-icons-color-SamoaColorIcon__a)">
            <path fill="#CF0921" d="M32 0H0v16h32z" />
            <path fill="#002780" d="M16.004 0H0v8.002h16.004z" />
            <path
                fill="#fff"
                d="M8.209.993 8.007.367l-.203.626h-.657l.531.385-.202.624.531-.386.531.386-.204-.624.531-.385zM5.76 2.99l-.204-.625-.203.624h-.655l.531.386-.203.623.53-.385.531.385-.203-.623.53-.386zm2.506 3.38-.259-.8-.26.8H6.91l.678.492-.258.796.678-.493.679.493-.26-.796.678-.493zm1.116-1.925-.135-.416-.135.416h-.438l.355.257-.137.416.355-.258.355.258-.137-.416.355-.257zm1.313-1.84-.193-.589-.191.59h-.62l.502.365-.191.589.5-.364.502.364-.191-.59.502-.365z"
            />
        </g>
    </IconBase>
);
export default SamoaColorIcon;
