import { Text } from '@vapor-ui/core';
import cx from 'clsx';

type CustomCSSProperties = React.CSSProperties & {
    '--cols'?: number;
    '--rows'?: number;
    '--gap'?: number | string;
};

const RenderingTemplateTitle = ({ title }: { title: string }) => {
    return <Text typography="heading3">{title}</Text>;
};

const RenderingTemplateComponent = ({
    children,
    cols,
    rows,
    gap,
}: {
    cols?: number;
    rows?: number;
    gap?: number | string;
    children: React.ReactNode;
}) => {
    const customStyle: CustomCSSProperties = {
        '--cols': cols,
        '--rows': rows,
        '--gap': gap,
    };

    return (
        <div
            className={cx(
                (cols || rows) &&
                    'grid w-fit [grid-template-columns:repeat(var(--cols,1),1fr)] [grid-template-rows:repeat(var(--rows,1),auto)] [gap:var(--gap,0.5rem)]',
            )}
            style={customStyle}
        >
            {children}
        </div>
    );
};
const RenderingTemplate = ({ children }: { children: React.ReactNode }) => {
    return <div className="flex flex-col gap-6">{children}</div>;
};

RenderingTemplate.Title = RenderingTemplateTitle;
RenderingTemplate.Component = RenderingTemplateComponent;

export default RenderingTemplate;
