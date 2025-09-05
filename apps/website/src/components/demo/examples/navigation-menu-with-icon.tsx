import { NavigationMenu } from '@vapor-ui/core';
import { HomeIcon, SettingIcon, StarIcon, UserIcon } from '@vapor-ui/icons';

export default function NavWithIcon() {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-sm font-medium mb-2">아이콘과 텍스트 조합</h4>
                <NavigationMenu.Root aria-label="Navigation with icons and text">
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#" className="flex items-center gap-2">
                                <HomeIcon size={16} />홈
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link
                                href="#"
                                selected
                                className="flex items-center gap-2"
                            >
                                <StarIcon size={16} />
                                즐겨찾기
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#" className="flex items-center gap-2">
                                <UserIcon size={16} />
                                프로필
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#" className="flex items-center gap-2">
                                <SettingIcon size={16} />
                                설정
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">아이콘만 사용</h4>
                <NavigationMenu.Root aria-label="Navigation with icons only">
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link
                                href="#"
                                className="flex items-center justify-center"
                                aria-label="홈"
                            >
                                <HomeIcon size={20} />
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link
                                href="#"
                                selected
                                className="flex items-center justify-center"
                                aria-label="즐겨찾기"
                            >
                                <StarIcon size={20} />
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link
                                href="#"
                                className="flex items-center justify-center"
                                aria-label="프로필"
                            >
                                <UserIcon size={20} />
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link
                                href="#"
                                className="flex items-center justify-center"
                                aria-label="설정"
                            >
                                <SettingIcon size={20} />
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">세로 방향에서의 아이콘</h4>
                <NavigationMenu.Root
                    direction="vertical"
                    aria-label="Vertical navigation with icons"
                >
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#" className="flex items-center gap-3">
                                <HomeIcon size={16} />
                                대시보드
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link
                                href="#"
                                selected
                                className="flex items-center gap-3"
                            >
                                <StarIcon size={16} />
                                즐겨찾기
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="#" className="flex items-center gap-3">
                                <UserIcon size={16} />
                                사용자 관리
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link
                                href="#"
                                disabled
                                className="flex items-center gap-3"
                            >
                                <SettingIcon size={16} />
                                시스템 설정
                            </NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
            </div>
        </div>
    );
}
