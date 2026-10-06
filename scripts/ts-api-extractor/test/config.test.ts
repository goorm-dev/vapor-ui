/**
 * Config unit tests
 */
import { defaultExtractorConfig as config } from '#domain/config/defaults';

describe('config', () => {
    it('기본 설정값 확인', () => {
        expect(config.filterExternal).toBe(true);
        expect(config.filterHtml).toBe(true);
        expect(config.filterSprinkles).toBe(true);
    });
});
