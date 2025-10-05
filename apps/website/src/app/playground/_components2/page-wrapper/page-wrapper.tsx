import { ThemePanel } from '../theme-panel';

type PageWrapperProps = {
    children: React.ReactNode;
};

const PageWrapper = ({ children }: PageWrapperProps) => {
    return (
        <>
            <ThemePanel />

            <div
                className="px-8 py-16 min-h-screen bg-[var(--vapor-color-background-canvas)]"
                data-playground-scope
            >
                <div className="w-max flex flex-col gap-12 [&>header]:flex [&>header]:flex-col [&>header]:gap-4 [&>section]:flex [&>section]:flex-col [&>section]:gap-[var(--vapor-size-space-800)]">
                    {children}
                </div>
            </div>
        </>
    );
};

export { PageWrapper };
