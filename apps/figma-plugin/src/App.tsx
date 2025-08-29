import { useState } from 'react';

import { figmaVariables } from '@vapor-ui/color-generator';

function App() {
    const [brandColor, setBrandColor] = useState('#2A6FF3');
    const [chroma, setChroma] = useState(100);
    const [hueShift, setHueShift] = useState(0);
    const [contrast, setContrast] = useState(100);

    const handleGeneratePalette = () => {
        try {
            console.log('Generated palette:', figmaVariables);
        } catch (error) {
            console.error('Error generating palette:', error);
        }
    };

    return (
        <main className="p-4 bg-white">
            <div className="border border-gray-300 rounded-lg p-4">
                {/* Brand Color Section */}
                <div className="flex items-center gap-2 mb-4">
                    <label className="text-sm font-medium text-gray-700">Brand Color:</label>
                    <input
                        type="text"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm flex-1"
                        placeholder="#2A6FF3"
                    />
                    <input
                        type="color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                        title="Pick color"
                    />
                </div>

                {/* Divider */}
                <div className="border-t border-gray-300 mb-4"></div>

                {/* Global Adjustments Section */}
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Global Adjustments</h3>

                    {/* Chroma */}
                    <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">Chroma:</span>
                            <span className="text-xs text-gray-600">{chroma}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={chroma}
                            onChange={(e) => setChroma(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Hue Shift */}
                    <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">Hue Shift:</span>
                            <span className="text-xs text-gray-600">{hueShift}°</span>
                        </div>
                        <input
                            type="range"
                            min="-180"
                            max="180"
                            value={hueShift}
                            onChange={(e) => setHueShift(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Contrast */}
                    <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">Contrast:</span>
                            <span className="text-xs text-gray-600">{contrast}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            value={contrast}
                            onChange={(e) => setContrast(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-300 mb-4"></div>

                {/* Generate Button */}
                <button
                    onClick={handleGeneratePalette}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                >
                    Generate Palette
                </button>
            </div>
        </main>
    );
}

export default App;
