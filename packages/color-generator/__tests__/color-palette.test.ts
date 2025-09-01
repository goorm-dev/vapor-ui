import { expect, describe, it } from 'vitest';
import { colorPalette } from '../src/index';

describe('Color Generator', () => {
  describe('colorPalette', () => {
    it('should generate consistent color palette collection', () => {
      expect(colorPalette).toMatchSnapshot();
    });

    it('should have required structure', () => {
      expect(colorPalette).toHaveProperty('base');
      expect(colorPalette).toHaveProperty('light');
      expect(colorPalette).toHaveProperty('dark');
      
      expect(colorPalette.base).toHaveProperty('white');
      expect(colorPalette.base).toHaveProperty('black');
      
      expect(colorPalette.light).toHaveProperty('background.canvas');
      expect(colorPalette.dark).toHaveProperty('background.canvas');
    });

    it('should have valid base colors', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      const oklchRegex = /^oklch\(/;
      
      expect(colorPalette.base.white.hex).toMatch(hexRegex);
      expect(colorPalette.base.white.oklch).toMatch(oklchRegex);
      expect(colorPalette.base.black.hex).toMatch(hexRegex);
      expect(colorPalette.base.black.oklch).toMatch(oklchRegex);
    });

    it('should have valid light theme colors', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      const oklchRegex = /^oklch\(/;
      
      Object.values(colorPalette.light).forEach(colorGroup => {
        Object.values(colorGroup).forEach(colorToken => {
          expect(colorToken.hex).toMatch(hexRegex);
          expect(colorToken.oklch).toMatch(oklchRegex);
        });
      });
    });

    it('should have valid dark theme colors', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      const oklchRegex = /^oklch\(/;
      
      Object.values(colorPalette.dark).forEach(colorGroup => {
        Object.values(colorGroup).forEach(colorToken => {
          expect(colorToken.hex).toMatch(hexRegex);
          expect(colorToken.oklch).toMatch(oklchRegex);
        });
      });
    });

    it('should have canvas background tokens', () => {
      expect(colorPalette.light.background.canvas).toBeDefined();
      expect(colorPalette.dark.background.canvas).toBeDefined();
      
      expect(colorPalette.light.background.canvas.hex).toBe('#ffffff');
      expect(colorPalette.dark.background.canvas.hex).toMatch(/^#[0-9a-f]{6}$/i);
      
      // Dark canvas should be different from light canvas
      expect(colorPalette.dark.background.canvas.hex)
        .not.toBe(colorPalette.light.background.canvas.hex);
    });

    it('should have same color categories in both themes', () => {
      const lightCategories = Object.keys(colorPalette.light).sort();
      const darkCategories = Object.keys(colorPalette.dark).sort();
      
      expect(lightCategories).toEqual(darkCategories);
    });

    it('should have same shade counts for each color', () => {
      Object.keys(colorPalette.light).forEach(category => {
        const lightShades = Object.keys(colorPalette.light[category]).sort();
        const darkShades = Object.keys(colorPalette.dark[category]).sort();
        
        expect(lightShades).toEqual(darkShades);
      });
    });

    it('should use 3-digit shade format (050 instead of 50)', () => {
      // Check if any color groups have '050' shade instead of '50'
      Object.keys(colorPalette.light).forEach(category => {
        if (category !== 'background') {
          const shades = Object.keys(colorPalette.light[category]);
          
          // Should have '050' not '50'
          expect(shades).toContain('050');
          expect(shades).not.toContain('50');
        }
      });
    });

    it('should have properly formatted OKLCH values', () => {
      // OKLCH format should be: oklch(L C H) with reasonable decimal precision
      const oklchRegex = /^oklch\([\d.]{1,5}\s+[\d.]{1,5}\s+[\d.]{1,5}\)$/;
      
      // Test base colors
      expect(colorPalette.base.white.oklch).toMatch(oklchRegex);
      expect(colorPalette.base.black.oklch).toMatch(oklchRegex);
      
      // Test theme colors
      Object.values(colorPalette.light).forEach(colorGroup => {
        Object.values(colorGroup).forEach(colorToken => {
          expect(colorToken.oklch).toMatch(oklchRegex);
          
          // Check that decimal places are reasonable (not overly long)
          const match = colorToken.oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
          if (match) {
            const [, l, c, h] = match;
            // L and C should have max 3 decimal places
            expect(l.split('.')[1]?.length || 0).toBeLessThanOrEqual(3);
            expect(c.split('.')[1]?.length || 0).toBeLessThanOrEqual(3);
            // H should have max 1 decimal place
            expect(h.split('.')[1]?.length || 0).toBeLessThanOrEqual(1);
          }
        });
      });
    });

    it('should have all expected shade variations', () => {
      const expectedShades = ['050', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
      
      Object.keys(colorPalette.light).forEach(category => {
        if (category !== 'background') {
          const shades = Object.keys(colorPalette.light[category]).sort();
          expect(shades).toEqual(expectedShades);
        }
      });
    });
  });
});