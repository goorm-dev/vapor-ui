import { Text } from '@vapor-ui/core';
import cn from 'classnames';

import styles from './rendering-template.module.scss';

const RenderingTemplateTitle = ({ title }: { title: string }) => {
    return <Text typography="heading3">{title}</Text>;
};

const RenderingTemplateComponent = ({
    children,
    isGrid,
}: {
     cols: number;
  rows?: number;
  gap?: number | string;
  children: React.ReactNode;
}) => {
    return <div className={cn(isGrid && styles.grid)}>{children}</div>;
};
const RenderingTemplate = ({ children }: { children: React.ReactNode }) => {
    return <div className={styles.container}>{children}</div>;
};

RenderingTemplate.Title = RenderingTemplateTitle;
RenderingTemplate.Component = RenderingTemplateComponent;

export default RenderingTemplate;
