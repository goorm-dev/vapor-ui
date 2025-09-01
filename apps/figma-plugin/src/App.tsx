import { useState } from 'react';

import {
    type ColorPaletteCollection,
    DEFAULT_CONTRAST_RATIOS,
    DEFAULT_MAIN_BACKGROUND_LIGHTNESS,
    DEFAULT_PRIMITIVE_COLORS,
    generateColorPalette,
} from '@vapor-ui/color-generator';

import { postMessage } from './figma-messages';
import { calculatePerceptualUniformity } from './utils/colorMetrics';

function App() {
    const [backgroundLightness, setBackgroundLightness] = useState<{ light: number; dark: number }>(
        {
            light: DEFAULT_MAIN_BACKGROUND_LIGHTNESS.light,
            dark: DEFAULT_MAIN_BACKGROUND_LIGHTNESS.dark,
        },
    );
    const [contrastRatios, setContrastRatios] = useState<Record<string, number>>({
        ...DEFAULT_CONTRAST_RATIOS,
    });
    const [primitiveColors, setPrimitiveColors] = useState<Record<string, string>>({ ...DEFAULT_PRIMITIVE_COLORS });
    const [generatedPalette, setGeneratedPalette] = useState<ColorPaletteCollection | null>(null);

    const handleGeneratePalette = () => {
        try {
            const config = {
                primitiveColors,
                contrastRatios,
                backgroundLightness,
            };

            const palette = generateColorPalette(config);
            setGeneratedPalette(palette);

            console.log('Generating palette with config:', config);

            postMessage({
                type: 'create-palette-sections',
                data: { generatedPalette: palette },
            });
        } catch (error) {
            console.error('Error generating palette:', error);
        }
    };

    return (
        <main className="p-4 bg-white">
            <div className="border border-gray-300 rounded-lg p-4">
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Global Adjustments</h3>

                    {/* Primitive Colors */}
                    <div className="mb-4">
                        <div className="text-xs font-medium text-gray-600 mb-2">Primitive Colors</div>
                        <div className="grid grid-cols-1 gap-2">
                            {Object.entries(primitiveColors).map(([colorName, colorValue]) => (
                                <div key={colorName} className="flex items-center gap-2">
                                    <label className="text-xs text-gray-600 min-w-[40px] capitalize">
                                        {colorName}:
                                    </label>
                                    <input
                                        type="text"
                                        value={colorValue}
                                        onChange={(e) =>
                                            setPrimitiveColors((prev) => ({
                                                ...prev,
                                                [colorName]: e.target.value,
                                            }))
                                        }
                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder="#000000"
                                    />
                                    <input
                                        type="color"
                                        value={colorValue}
                                        onChange={(e) =>
                                            setPrimitiveColors((prev) => ({
                                                ...prev,
                                                [colorName]: e.target.value,
                                            }))
                                        }
                                        className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
                                        title={`Pick ${colorName} color`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Background Lightness */}
                    <div className="mb-4">
                        <div className="text-xs font-medium text-gray-600 mb-2">
                            Background Lightness
                        </div>
                        <div className="mb-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600">Light Theme:</span>
                                <span className="text-xs text-gray-600">
                                    {backgroundLightness.light}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="85"
                                max="100"
                                value={backgroundLightness.light}
                                onChange={(e) =>
                                    setBackgroundLightness((prev) => ({
                                        ...prev,
                                        light: Number(e.target.value),
                                    }))
                                }
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div className="mb-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600">Dark Theme:</span>
                                <span className="text-xs text-gray-600">
                                    {backgroundLightness.dark}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="25"
                                value={backgroundLightness.dark}
                                onChange={(e) =>
                                    setBackgroundLightness((prev) => ({
                                        ...prev,
                                        dark: Number(e.target.value),
                                    }))
                                }
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="text-xs font-medium text-gray-600 mb-2">
                            Contrast Ratios
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(contrastRatios).map(([shade, ratio]) => (
                                <div key={shade} className="flex items-center gap-2">
                                    <label className="text-xs text-gray-600 min-w-[28px]">{shade}:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="21"
                                        step="0.1"
                                        value={ratio}
                                        onChange={(e) =>
                                            setContrastRatios((prev) => ({
                                                ...prev,
                                                [shade]: Number(e.target.value),
                                            }))
                                        }
                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {generatedPalette &&
                    (() => {
                        const metrics = calculatePerceptualUniformity(generatedPalette);
                        return metrics ? (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="text-xs font-medium text-gray-700 mb-2">
                                    Perceptual Uniformity
                                </div>
                                <div className="text-xs text-gray-600 mb-1">
                                    Uniformity Score:{' '}
                                    <span className="font-medium">{metrics.uniformity}%</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                    Lightness Range: {metrics.lightnessRange.min} -{' '}
                                    {metrics.lightnessRange.max}
                                </div>
                            </div>
                        ) : null;
                    })()}

                <div className="border-t border-gray-300 mb-4"></div>

                <div>
                    <button
                        onClick={handleGeneratePalette}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                    >
                        Generate Palette
                    </button>
                </div>
            </div>
        </main>
    );
}

export default App;
