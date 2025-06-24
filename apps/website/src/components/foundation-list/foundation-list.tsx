import styles from './foundation-list.module.scss';

const FoundationList = ({ children }: { children: React.ReactNode }) => {
    return <div className={styles.container}>{children}</div>;
};

export default FoundationList;
