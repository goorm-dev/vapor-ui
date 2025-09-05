import type { ReactNode } from 'react';
import { Children, cloneElement, isValidElement } from 'react';

import { Text } from '@vapor-ui/core';
import { kebabCase } from 'lodash-es';

import styles from './section.module.scss';

type SectionProps = { title: string; children: ReactNode };

const Section = ({ title, children }: SectionProps) => {
    // move to libs, merge-props, compose-refs ....
    const Element = () => {
        if (!isValidElement(children)) {
            return Children.count(children) > 1 ? Children.only(null) : null;
        }

        return cloneElement(children, {
            ...children.props,
            'aria-describedby': `${kebabCase(title)}-title`,
        });
    };

    return (
        <section className={styles.section}>
            <Text id={`${kebabCase(title)}-title`} typography="subtitle1" render={<p />}>
                {title}
            </Text>

            <Element />
        </section>
    );
};

export default Section;
