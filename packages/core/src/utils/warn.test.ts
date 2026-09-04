import { warn } from './warn';

describe('warn', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    it('warns once per message', () => {
        warn('same message');
        warn('same message');

        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy).toHaveBeenCalledWith('Vapor UI: same message');
    });

    it('warns for each distinct message', () => {
        warn('first message');
        warn('second message');

        expect(warnSpy).toHaveBeenCalledTimes(2);
    });
});
