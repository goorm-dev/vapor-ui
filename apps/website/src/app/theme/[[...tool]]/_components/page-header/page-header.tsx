import { Badge, Text } from '@vapor-ui/core';

/* -------------------------------------------------------------------------------------------------
 * Responsive Title
 * -----------------------------------------------------------------------------------------------*/
const ResponsiveTitle = ({ children }: { children: React.ReactNode }) => (
    <>
        <Text typography="display4" render={<h1>{children}</h1>} className="hidden lg:block" />
        <Text
            typography="heading1"
            render={<h1>{children}</h1>}
            className="hidden md:max-lg:block"
        />
        <Text
            typography="heading2"
            render={<h1>{children}</h1>}
            className="hidden sm:max-md:block"
        />
        <Text typography="heading3" render={<h1>{children}</h1>} className="block sm:hidden" />
    </>
);

/* -------------------------------------------------------------------------------------------------
 * Page Header
 * -----------------------------------------------------------------------------------------------*/
export const PageHeader = () => (
    <div className="flex flex-col gap-v-150 items-start">
        <div className="flex flex-col gap-v-150 items-start w-full">
            <Badge colorPalette="hint" shape="pill" size="lg">
                Theme
            </Badge>
        </div>
        <div className="flex flex-col gap-v-200 items-start">
            <ResponsiveTitle>
                Build themes that work
                <br />
                for every brand
            </ResponsiveTitle>
            <Text typography="body1" foreground="normal-100">
                다크모드 지원부터 브랜드 커스터마이징까지.
                <br />
                Vapor UI의 테마 도구로 접근성 기준을 충족하는 테마를 손쉽게 구축하세요.
            </Text>
        </div>
    </div>
);
