//@ts-nocheck
import { Nav } from '@goorm-dev/vapor-core';

function App() {
    return (
        <Nav size="lg" type="pill">
            <ul className={styles.navList}>
                {leftPanelList.map(({ title }, index) => (
                    <Nav.Item key={title}>
                        <Nav.Link
                            active={leftPaneActiveIndex === index}
                            onClick={() => handleLeftPaneHandlerClick(index)}
                        >
                            {title}
                        </Nav.Link>
                    </Nav.Item>
                ))}
            </ul>
        </Nav>
    );
}
