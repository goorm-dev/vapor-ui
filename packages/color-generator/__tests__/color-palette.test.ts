import { expect, describe, it } from 'vitest';
import { figmaVariables } from '../src/index';

describe('Color Generator', () => {
  describe('figmaVariables', () => {
    it('should generate consistent Figma variable collection', () => {
      expect(figmaVariables).toMatchSnapshot();
    });

    it('should have required structure', () => {
      expect(figmaVariables).toHaveProperty('base');
      expect(figmaVariables).toHaveProperty('light');
      expect(figmaVariables).toHaveProperty('dark');
      
      expect(figmaVariables.base).toHaveProperty('white');
      expect(figmaVariables.base).toHaveProperty('black');
      
      expect(figmaVariables.light).toHaveProperty('background.canvas');
      expect(figmaVariables.dark).toHaveProperty('background.canvas');
    });

    it('should have valid base colors', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      const oklchRegex = /^oklch\(/;
      
      expect(figmaVariables.base.white.hex).toMatch(hexRegex);
      expect(figmaVariables.base.white.oklch).toMatch(oklchRegex);
      expect(figmaVariables.base.black.hex).toMatch(hexRegex);
      expect(figmaVariables.base.black.oklch).toMatch(oklchRegex);
    });

    it('should have valid light theme colors', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      const oklchRegex = /^oklch\(/;
      
      Object.values(figmaVariables.light).forEach(colorGroup => {
        Object.values(colorGroup).forEach(colorToken => {
          expect(colorToken.hex).toMatch(hexRegex);
          expect(colorToken.oklch).toMatch(oklchRegex);
        });
      });
    });

    it('should have valid dark theme colors', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      const oklchRegex = /^oklch\(/;
      
      Object.values(figmaVariables.dark).forEach(colorGroup => {
        Object.values(colorGroup).forEach(colorToken => {
          expect(colorToken.hex).toMatch(hexRegex);
          expect(colorToken.oklch).toMatch(oklchRegex);
        });
      });
    });

    it('should have canvas background tokens', () => {
      expect(figmaVariables.light.background.canvas).toBeDefined();
      expect(figmaVariables.dark.background.canvas).toBeDefined();
      
      expect(figmaVariables.light.background.canvas.hex).toBe('#ffffff');
      expect(figmaVariables.dark.background.canvas.hex).toMatch(/^#[0-9a-f]{6}$/i);
      
      // Dark canvas should be different from light canvas
      expect(figmaVariables.dark.background.canvas.hex)
        .not.toBe(figmaVariables.light.background.canvas.hex);
    });

    it('should have same color categories in both themes', () => {
      const lightCategories = Object.keys(figmaVariables.light).sort();
      const darkCategories = Object.keys(figmaVariables.dark).sort();
      
      expect(lightCategories).toEqual(darkCategories);
    });

    it('should have same shade counts for each color', () => {
      Object.keys(figmaVariables.light).forEach(category => {
        const lightShades = Object.keys(figmaVariables.light[category]).sort();
        const darkShades = Object.keys(figmaVariables.dark[category]).sort();
        
        expect(lightShades).toEqual(darkShades);
      });
    });
  });
});