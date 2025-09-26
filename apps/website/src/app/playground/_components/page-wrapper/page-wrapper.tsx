'use client';

import styles from './page-wrapper.module.scss';

type PageWrapperProps = {
    children: React.ReactNode;
};

const PageWrapper = ({ children }: PageWrapperProps) => {
    return (
        <>
            <div className={styles.container}>
                <div className={styles.wrapper}>{children}</div>
            </div>
        </>
    );
};

export default PageWrapper;
