import { cleanup, render } from '@testing-library/react';
import { axe } from 'vitest-axe';

import type { AvatarRootProps } from './avatar';
import { Avatar } from './avatar';

const AvatarTest = (props: AvatarRootProps) => {
    return (
        <Avatar.Root {...props}>
            <Avatar.Image />
            <Avatar.Fallback />
        </Avatar.Root>
    );
};

describe('Avatar', () => {
    const originalGlobalImage = window.Image;

    beforeAll(() => {
        (window.Image as unknown) = MockImage;
    });

    afterAll(() => {
        window.Image = originalGlobalImage;
        vi.restoreAllMocks();
    });

    afterEach(cleanup);

    beforeEach(() => {
        cache.clear();
    });

    it('should have no a11y violations', async () => {
        const imageAlt = 'Avatar Image';

        const rendered = render(<AvatarTest alt={imageAlt} />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    it('should not render the image when no src is provided', () => {
        const alt = 'Avatar Image';

        const rendered = render(<AvatarTest alt={alt} />);
        const image = rendered.queryByRole('img');

        expect(image).not.toBeInTheDocument();
    });

    it('should render the fallback when no src is provided', () => {
        const alt = 'Avatar Image';

        const rendered = render(<AvatarTest alt={alt} />);
        const fallback = rendered.queryByText(alt[0].toUpperCase());

        expect(fallback).toBeInTheDocument();
    });

    it('should not render the image initially', () => {
        const src = 'https://cdn.mos.cms.futurecdn.net/yuenhhyDC6DR5rv6KQNxu5.png';
        const alt = 'Avatar Image';

        const rendered = render(<AvatarTest src={src} alt={alt} />);
        const image = rendered.queryByRole('img');

        expect(image).not.toBeInTheDocument();
    });

    it('should render the image after it has loaded', async () => {
        const src = 'https://cdn.mos.cms.futurecdn.net/yuenhhyDC6DR5rv6KQNxu5.png';
        const alt = 'Avatar Image';

        const rendered = render(<AvatarTest src={src} alt={alt} />);
        const image = await rendered.findByRole('img');

        expect(image).toBeInTheDocument();
    });

    it('should have alternative text on the image', async () => {
        const src = 'https://cdn.mos.cms.futurecdn.net/yuenhhyDC6DR5rv6KQNxu5.png';
        const alt = 'Avatar Image';

        const rendered = render(<AvatarTest src={src} alt={alt} />);
        const image = await rendered.findByRole('img');

        expect(image).toHaveAttribute('alt', alt);
    });

    it('can handle changing src', async () => {
        const src = 'https://cdn.mos.cms.futurecdn.net/yuenhhyDC6DR5rv6KQNxu5.png';
        const src2 = 'https://cdn.kinocheck.com/i/c6b9vau1yd.jpg';
        const alt = 'Avatar Image';
        let image: HTMLElement | null = null;

        const rendered = render(<AvatarTest src={src} alt={alt} />);

        image = await rendered.findByRole('img');
        expect(image).toBeInTheDocument();

        /** change image source */
        rendered.rerender(<AvatarTest src={src2} alt={alt} />);
        image = rendered.queryByRole('img');
        expect(image).not.toBeInTheDocument();

        image = await rendered.findByRole('img');
        expect(image).toBeInTheDocument();
    });
});

const AvatarFallbackTest = (props: AvatarRootProps) => {
    return (
        <Avatar.Root {...props}>
            <Avatar.Fallback />
        </Avatar.Root>
    );
};

describe('Avatar.Fallback', () => {
    it('should render the fallback content', () => {
        const rendered = render(<AvatarFallbackTest alt="Avatar Image" />);
        const fallback = rendered.getByText('A');

        expect(fallback).toBeInTheDocument();
    });

    // delayMs만큼 기다린 후에 fallback이 렌더링되는지 확인하는 테스트
    it('should render the fallback after a delay', async () => {
        const alt = 'Avatar Image';
        const delayMs = 300;
        const rendered = render(<AvatarFallbackTest alt={alt} delayMs={delayMs} />);
        let fallback: HTMLElement | null;

        fallback = rendered.queryByText(alt.charAt(0).toUpperCase());
        expect(fallback).not.toBeInTheDocument();

        fallback = await rendered.findByText(alt.charAt(0).toUpperCase());
        expect(fallback).toBeInTheDocument();
    });
});

/* -----------------------------------------------------------------------------------------------*/

const cache = new Set<string>();
const DELAY = 300;

class MockImage extends EventTarget {
    _src: string = '';

    constructor() {
        super();
        return this;
    }

    get src() {
        return this._src;
    }

    set src(src: string) {
        if (!src) {
            return;
        }
        this._src = src;
        this.onSrcChange();
    }

    get complete() {
        return !this.src || cache.has(this.src);
    }

    get naturalWidth() {
        return this.complete ? 300 : 0;
    }

    onSrcChange() {
        setTimeout(() => {
            this.dispatchEvent(new Event('load'));
            cache.add(this.src);
        }, DELAY);
    }
}
