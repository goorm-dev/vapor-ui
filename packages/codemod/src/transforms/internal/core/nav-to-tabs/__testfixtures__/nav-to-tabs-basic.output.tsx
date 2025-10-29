//@ts-nocheck
import { Tabs } from '@vapor-ui/core';

function App() {
    return (
        <Tabs.Root size="lg" variant="fill">
            <ul className={styles.navList}>
                {leftPanelList.map(({ title }, index) => (
                    <Tabs.Trigger
                        key={title}
                        selected={leftPaneActiveIndex === index}
                        onClick={() => handleLeftPaneHandlerClick(index)}
                    >
                        {title}
                    </Tabs.Trigger>
                ))}
            </ul>
        </Tabs.Root>
    );
}
