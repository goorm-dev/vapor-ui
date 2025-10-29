//@ts-nocheck
import { Tabs } from '@vapor-ui/core';

function App() {
    return (
        <Tabs.Root size="lg" variant="fill">
            <ul className={styles.navList}>
                {leftPanelList.map(({ title }, index) => (
                    <Nav.Item key={title}>
                        {/* TODO: href prop removed. Use value prop for tabs. Add Tabs.Panel for content. */}
                        <Tabs.Trigger
                            selected={leftPaneActiveIndex === index}
                            onClick={() => handleLeftPaneHandlerClick(index)}
                        >
                            {title}
                        </Tabs.Trigger>
                    </Nav.Item>
                ))}
            </ul>
        </Tabs.Root>
    );
}
