import styles from './all-components-container.module.scss';
import clsx from 'clsx';

const AllComponentsContainer = ({ children }: { children: React.ReactNode }) => {
    return <div className={clsx(styles.container, 'not-prose')}>{children}</div>;
};

export default AllComponentsContainer;
