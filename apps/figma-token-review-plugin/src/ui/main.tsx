import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';

import App from './App';
import { ErrorBoundary } from './components/error-boundary';
import { Providers } from './providers';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErrorBoundary>
            <Providers>
                <App />
            </Providers>
        </ErrorBoundary>
    </StrictMode>,
);
