import { Breadcrumb } from '@vapor-ui/core';
import { ChevronRightOutlineIcon, HomeIcon } from '@vapor-ui/icons';

export default function BreadcrumbComposition() {
    return (
        <div className="space-y-6">
            {/* Basic composition */}
            <div>
                <h4 className="mb-2 text-sm font-medium">기본 구성</h4>
                <Breadcrumb.Root size="md">
                    <Breadcrumb.List>
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#">Products</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                            <Breadcrumb.Link current>Details</Breadcrumb.Link>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>

            {/* With custom separator */}
            <div>
                <h4 className="mb-2 text-sm font-medium">커스텀 구분자</h4>
                <Breadcrumb.Root size="md">
                    <Breadcrumb.List>
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator>
                            <ChevronRightOutlineIcon />
                        </Breadcrumb.Separator>
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#">Products</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator>
                            <ChevronRightOutlineIcon />
                        </Breadcrumb.Separator>
                        <Breadcrumb.Item>
                            <Breadcrumb.Link current>Details</Breadcrumb.Link>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>

            {/* With icons in links */}
            <div>
                <h4 className="mb-2 text-sm font-medium">링크에 아이콘 포함</h4>
                <Breadcrumb.Root size="md">
                    <Breadcrumb.List>
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#" className="flex items-center gap-1">
                                <HomeIcon className="w-4 h-4" />
                                Home
                            </Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#">Dashboard</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                            <Breadcrumb.Link current>Settings</Breadcrumb.Link>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>
        </div>
    );
}
