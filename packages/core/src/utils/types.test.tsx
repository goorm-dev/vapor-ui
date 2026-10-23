import { Avatar, Checkbox, Collapsible, Form, NavigationMenu, Toolbar } from '~/index';

// Type-level regression test: `tsc --noEmit` fails with TS7006 if `style`/`render`
// callbacks fall back to implicit `any` (Base UI and vapor-ui signatures intersecting).
describe('VaporUIComponentProps', () => {
    it('infers state for style/render callbacks', () => {
        const element = (
            <>
                <Checkbox.Root style={(state) => ({ opacity: state.checked ? 1 : 0 })} />
                <Checkbox.Root
                    render={(props, state) => <span {...props} data-c={state.checked} />}
                />
                <NavigationMenu.Link style={(state) => ({ opacity: state.current ? 1 : 0 })} />
                <NavigationMenu.Link
                    render={(props, state) => (
                        <a {...props} data-a={state.current}>
                            link
                        </a>
                    )}
                />
                <Avatar.ImagePrimitive
                    render={(props, state) => (
                        <img {...props} alt="" data-s={state.imageLoadingStatus} />
                    )}
                />
                <Form render={(props, state) => <form {...props} data-s={String(state)} />} />
                <Collapsible.Trigger
                    render={(props, state) => <button {...props} data-o={state.open} />}
                />
                <Toolbar.Separator
                    render={(props, state) => <div {...props} data-o={state.orientation} />}
                />
            </>
        );

        expect(element).toBeTruthy();
    });
});
