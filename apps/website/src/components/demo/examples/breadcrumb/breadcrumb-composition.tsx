import { Breadcrumb } from '@vapor-ui/core';
import { ChevronRightOutlineIcon, HomeIcon } from '@vapor-ui/icons';

export default function BreadcrumbComposition() {
    return (
        <div className="space-y-6">
            {/* Basic composition */}
            <div>
                <h4 className="mb-2 text-sm font-medium">기본 구성</h4>
                <Breadcrumb.Root size="md">
                    <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#">Products</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item current>Details</Breadcrumb.Item>
                </Breadcrumb.Root>
            </div>

            {/* With custom separator */}
            <div>
                <h4 className="mb-2 text-sm font-medium">커스텀 구분자</h4>
                <Breadcrumb.Root size="md">
                    <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                    <Breadcrumb.Separator>
                        <ChevronRightOutlineIcon />
                    </Breadcrumb.Separator>
                    <Breadcrumb.Item href="#">Products</Breadcrumb.Item>
                    <Breadcrumb.Separator>
                        <ChevronRightOutlineIcon />
                    </Breadcrumb.Separator>
                    <Breadcrumb.Item current>Details</Breadcrumb.Item>
                </Breadcrumb.Root>
            </div>

            {/* With icons in links */}
            <div>
                <h4 className="mb-2 text-sm font-medium">링크에 아이콘 포함</h4>
                <Breadcrumb.Root size="md">
                    <Breadcrumb.Item href="#" className="flex items-center gap-1">
                        <HomeIcon className="w-4 h-4" />
                        Home
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#">Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item current>Settings</Breadcrumb.Item>
                </Breadcrumb.Root>
            </div>
        </div>
    );
}
