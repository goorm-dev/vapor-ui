import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

// sidepanel 수명 = 이 port의 수명. background가 onConnect/onDisconnect로
// 열림·닫힘을 감지해 content에 통보한다. StrictMode 밖에서 한 번만 연다.
browser.runtime.connect({ name: 'sidepanel' });

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
