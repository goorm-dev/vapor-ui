import { useState } from 'react';

import { PrimitiveColorsTab } from './components/PrimitiveColorsTab';
import { SemanticColorsTab } from './components/SemanticColorsTab';

function App() {
    const [activeTab, setActiveTab] = useState<'primitive' | 'semantic'>('primitive');

    return (
        <main className="bg-white p-2">
            {/* Tab Navigation */}
            <div role="tablist" className="flex border-b border-gray-200">
                <button
                    role="tab"
                    tabIndex={activeTab === 'primitive' ? 0 : -1}
                    onClick={() => setActiveTab('primitive')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'primitive'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Primitive Colors
                </button>
                <button
                    role="tab"
                    tabIndex={activeTab === 'semantic' ? 0 : -1}
                    onClick={() => setActiveTab('semantic')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'semantic'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Semantic Colors
                </button>
            </div>

            {/* Tab Content */}
            <div className="p-4" role="tabpanel">
                {activeTab === 'primitive' ? <PrimitiveColorsTab /> : <SemanticColorsTab />}
            </div>
        </main>
    );
}

export default App;
