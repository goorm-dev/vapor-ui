import { cleanup, render, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';

import { Avatar } from '.';

const AvatarTest = (props: Avatar.Root.Props) => {
    return <Avatar.Root {...props} />;
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

    it('should render both image and fallback initially', () => {
        const src = 'https://cdn.mos.cms.futurecdn.net/yuenhhyDC6DR5rv6KQNxu5.png';
        const alt = 'Avatar Image';

        const rendered = render(<AvatarTest src={src} alt={alt} />);
        const image = rendered.queryByRole('img');
        const fallback = rendered.queryByText(alt.charAt(0).toUpperCase());

        expect(image).toBeInTheDocument();
        expect(fallback).toBeInTheDocument();
    });

    it('should render the image after it has loaded', async () => {
        const src = 'https://cdn.mos.cms.futurecdn.net/yuenhhyDC6DR5rv6KQNxu5.png';
        const alt = 'Avatar Image';

        const rendered = render(<AvatarTest src={src} alt={alt} />);
        const image = await rendered.findByRole('img');

        expect(image).toBeInTheDocument();

        await waitFor(() => {
            expect(rendered.queryByText(alt.charAt(0).toUpperCase())).not.toBeInTheDocument();
        });
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
        const fallbackText = alt.charAt(0).toUpperCase();
        let image: HTMLElement | null = null;

        const rendered = render(<AvatarTest src={src} alt={alt} />);

        expect(rendered.queryByRole('img')).toBeInTheDocument();
        expect(rendered.queryByText(fallbackText)).toBeInTheDocument();

        image = await rendered.findByRole('img');
        expect(image).toBeInTheDocument();
        await waitFor(() => {
            expect(rendered.queryByText(fallbackText)).not.toBeInTheDocument();
        });

        /** change image source */
        rendered.rerender(<AvatarTest src={src2} alt={alt} />);

        expect(rendered.queryByRole('img')).toBeInTheDocument();
        expect(rendered.queryByText(fallbackText)).toBeInTheDocument();

        image = rendered.queryByRole('img');
        expect(image).toBeInTheDocument();

        image = await rendered.findByRole('img');
        expect(image).toBeInTheDocument();
        await waitFor(() => {
            expect(rendered.queryByText(fallbackText)).not.toBeInTheDocument();
        });
    });
});

const AvatarFallbackTest = (props: Avatar.Root.Props) => {
    return <Avatar.Root {...props} />;
};

describe('Avatar.Fallback', () => {
    it('should render the fallback content', () => {
        const rendered = render(<AvatarFallbackTest alt="Avatar Image" />);
        const fallback = rendered.getByText('A');

        expect(fallback).toBeInTheDocument();
    });

    // delay만큼 기다린 후에 fallback이 렌더링되는지 확인하는 테스트
    it('should render the fallback after a delay', async () => {
        const alt = 'Avatar Image';
        const delay = 300;
        const rendered = render(<AvatarFallbackTest alt={alt} delay={delay} />);
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
