import './block.css';

import type { ComponentProps } from 'react';

import { Avatar, Collapsible, HStack, IconButton, NavigationMenu, Sheet } from '@vapor-ui/core';
import {
    BellOnIcon,
    ChevronDownOutlineIcon,
    CloseOutlineIcon,
    MenuOutlineIcon,
} from '@vapor-ui/icons';

export default function Block1() {
    return (
        <HStack
            width="100%"
            justifyContent="space-between"
            paddingX={{ desktop: '$400', mobile: '$200' }}
            paddingY={{ desktop: '$100', mobile: '$050' }}
        >
            <HStack gap="$200">
                <LogoSvg className="logo" />

                <NavigationMenu.Root aria-label="Main" className="navbar-desktop">
                    <NavigationMenu.List>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="/features">Features</NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item>
                            <NavigationMenu.Link href="/templates">Templates</NavigationMenu.Link>
                        </NavigationMenu.Item>
                    </NavigationMenu.List>
                </NavigationMenu.Root>
            </HStack>

            <HStack gap="$100">
                <Avatar.Root shape="circle" alt="bell" render={<button />}>
                    <BellOnIcon />
                </Avatar.Root>
                <Avatar.Simple shape="circle" alt="goorm" />

                <Sheet.Root>
                    <Sheet.Trigger
                        render={
                            <IconButton
                                aria-label="Open Menu"
                                variant="ghost"
                                color="secondary"
                                className="navbar-mobile"
                            />
                        }
                    >
                        <MenuOutlineIcon />
                    </Sheet.Trigger>
                    <Sheet.Portal>
                        <Sheet.Overlay />
                        <Sheet.Positioner side="top">
                            <Sheet.Popup>
                                <Sheet.Header>
                                    <HStack gap="$200" justifyContent="space-between" width="100%">
                                        <LogoSvg className="logo" />

                                        <HStack gap="$100">
                                            <Avatar.Root
                                                shape="circle"
                                                alt="bell"
                                                render={<button />}
                                            >
                                                <BellOnIcon />
                                            </Avatar.Root>
                                            <Avatar.Simple shape="circle" alt="goorm" />
                                            <Sheet.Close
                                                render={
                                                    <IconButton
                                                        aria-label="Close Sheet"
                                                        variant="ghost"
                                                        color="secondary"
                                                    />
                                                }
                                            >
                                                <CloseOutlineIcon />
                                            </Sheet.Close>
                                        </HStack>
                                    </HStack>
                                </Sheet.Header>

                                <Sheet.Body>
                                    <NavigationMenu.Root
                                        aria-label="Main"
                                        direction="vertical"
                                        className="vertical-navigation-menu"
                                    >
                                        <NavigationMenu.List>
                                            <NavigationMenu.Item>
                                                <Collapsible.Root>
                                                    <Collapsible.Trigger
                                                        className={'collapsible-trigger'}
                                                        render={<NavigationMenu.Link />}
                                                    >
                                                        Features
                                                        <ChevronDownOutlineIcon />
                                                    </Collapsible.Trigger>

                                                    <Collapsible.Panel>
                                                        <NavigationMenu.List>
                                                            <NavigationMenu.Item>
                                                                <NavigationMenu.Link
                                                                    href="#"
                                                                    className="nested-link-item"
                                                                >
                                                                    Container
                                                                </NavigationMenu.Link>
                                                            </NavigationMenu.Item>
                                                            <NavigationMenu.Item>
                                                                <NavigationMenu.Link
                                                                    href="#"
                                                                    className="nested-link-item"
                                                                >
                                                                    SBOM
                                                                </NavigationMenu.Link>
                                                            </NavigationMenu.Item>
                                                        </NavigationMenu.List>
                                                    </Collapsible.Panel>
                                                </Collapsible.Root>
                                            </NavigationMenu.Item>
                                            <NavigationMenu.Item>
                                                <NavigationMenu.Link className="link-item" href="#">
                                                    Pricing
                                                </NavigationMenu.Link>
                                            </NavigationMenu.Item>
                                            <NavigationMenu.Item>
                                                <NavigationMenu.Link className="link-item" href="#">
                                                    Templates
                                                </NavigationMenu.Link>
                                            </NavigationMenu.Item>
                                        </NavigationMenu.List>
                                    </NavigationMenu.Root>
                                </Sheet.Body>
                            </Sheet.Popup>
                        </Sheet.Positioner>
                    </Sheet.Portal>
                </Sheet.Root>
            </HStack>
        </HStack>
    );
}

const LogoSvg = (props: ComponentProps<'svg'>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="32"
            viewBox="0 0 80 28"
            fill="none"
            {...props}
        >
            <g clipPath="url(#clip0_105_38)">
                <path
                    d="M38.2467 24.9887V17.1446C39.5989 18.1508 41.2491 18.7226 42.945 18.7226C47.2766 18.7226 50.8061 15.2007 50.8061 10.8785C50.8061 6.55625 47.2766 3.03442 42.945 3.03442C38.6134 3.03442 35.084 6.55625 35.084 10.8785V25.0116L38.2467 24.9887ZM42.945 6.16748C45.5348 6.16748 47.6433 8.27143 47.6433 10.8556C47.6433 13.4398 45.5348 15.5438 42.945 15.5438C40.3552 15.5438 38.2467 13.4398 38.2467 10.8556C38.2467 8.27143 40.3552 6.16748 42.945 6.16748Z"
                    fill="#2B2D36"
                />
                <path
                    d="M60.6379 2.98853C56.2834 2.98853 52.7769 6.51035 52.7769 10.8326C52.7769 15.1548 56.3063 18.6767 60.6379 18.6767C64.9695 18.6767 68.4989 15.1548 68.4989 10.8326C68.4989 6.51035 64.9924 2.98853 60.6379 2.98853ZM60.6379 15.5436C58.0252 15.5436 55.9167 13.4397 55.9167 10.8326C55.9167 8.22553 58.0252 6.12158 60.6379 6.12158C63.2506 6.12158 65.3591 8.22553 65.3591 10.8326C65.3591 13.4397 63.2506 15.5436 60.6379 15.5436Z"
                    fill="#2B2D36"
                />
                <path
                    d="M77.9187 3.40015C73.9997 3.40015 70.8369 6.55607 70.8369 10.4667V18.3108H73.9767V10.4667C73.9767 8.29412 75.7415 6.5332 77.9187 6.5332H79.5001V3.40015H77.9187Z"
                    fill="#2B2D36"
                />
                <path
                    d="M32.5629 10.8556C32.5629 6.51044 29.0335 3.01147 24.7019 3.01147C20.3473 3.01147 16.8408 6.5333 16.8408 10.8556C16.8408 15.1778 20.3703 18.6996 24.7019 18.6996C26.4666 18.6996 28.1167 18.105 29.4231 17.1217V18.3109H32.5629V11.1071C32.54 11.0385 32.5629 10.947 32.5629 10.8556ZM24.6789 15.5437C22.0662 15.5437 19.9577 13.4397 19.9577 10.8327C19.9577 8.22561 22.0662 6.12166 24.6789 6.12166C27.2916 6.12166 29.4001 8.22561 29.4001 10.8327C29.4001 13.4397 27.2916 15.5437 24.6789 15.5437Z"
                    fill="#2B2D36"
                />
                <path
                    d="M16.5888 3.40015L9.91949 18.3108H7.14636L0.5 3.40015H3.93777L8.54439 13.6912L13.1281 3.40015H16.5888Z"
                    fill="#2B2D36"
                />
            </g>
            <defs>
                <clipPath id="clip0_105_38">
                    <rect width="79" height="28" fill="white" transform="translate(0.5)" />
                </clipPath>
            </defs>
        </svg>
    );
};
