import { Text } from '@vapor-ui/core';
import cn from 'classnames';

import styles from './rendering-template.module.scss';

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
        <div className={cn((cols || rows) && styles.grid)} style={customStyle}>
            {children}
        </div>
    );
};
const RenderingTemplate = ({ children }: { children: React.ReactNode }) => {
    return <div className={styles.container}>{children}</div>;
};

RenderingTemplate.Title = RenderingTemplateTitle;
RenderingTemplate.Component = RenderingTemplateComponent;

export default RenderingTemplate;
