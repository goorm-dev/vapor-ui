import { useState } from 'react';

import { Box } from '@vapor-ui/core';

import { BrandColorsTab } from './features/brand-colors-tab';
import { PrimitiveColorsTab } from './features/primitive-colors-tab';

function App() {
    const [activeTab, setActiveTab] = useState<'primitive' | 'brand'>('primitive');

    return (
        <Box className="bg-white p-v-100">
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
                    tabIndex={activeTab === 'brand' ? 0 : -1}
                    onClick={() => setActiveTab('brand')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'brand'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Brand Colors
                </button>
            </div>

            {/* Tab Content */}
            <Box className="p-v-200" role="tabpanel">
                {activeTab === 'primitive' ? <PrimitiveColorsTab /> : <BrandColorsTab />}
            </Box>
        </Box>
    );
}

export default App;
