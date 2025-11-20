import React from 'react';

import { Avatar, Badge, Text } from '@vapor-ui/core';

export interface UserListItemProps {
    name?: string;
    badge?: string;
    online: boolean;
    lastActiveDaysAgo?: number; // 미접속일 경우 N일 전 접속
    avatarAlt?: string;
}

export function UserListItem({
    name,
    badge,
    online,
    lastActiveDaysAgo,
    avatarAlt,
}: UserListItemProps) {
    return (
        <div className="w-full flex h-[var(--vapor-size-dimension-500)] items-center gap-[var(--vapor-size-space-100)] self-stretch">
            <Avatar.Root alt={avatarAlt || name || 'User'} shape="circle" size="md">
                <Avatar.FallbackPrimitive className="!text-[var(--vapor-color-white)]" />
                <Avatar.ImagePrimitive />
            </Avatar.Root>
            <div className="flex flex-col items-start gap-[var(--vapor-size-space-000)] flex-1 basis-0 grow">
                <div className="flex items-center gap-[var(--vapor-size-space-050)] self-stretch">
                    <Text typography="subtitle1" foreground="hint-200">
                        {name || '이름 없음'}
                    </Text>
                    {badge && (
                        <Badge colorPalette="primary" shape="pill">
                            {badge}
                        </Badge>
                    )}
                </div>
                <div>
                    {online ? (
                        <Text typography="subtitle2" foreground="hint-100">
                            온라인
                        </Text>
                    ) : (
                        <Text typography="subtitle2" foreground="hint-100">
                            {lastActiveDaysAgo ? `${lastActiveDaysAgo}일 전 접속` : '오프라인'}
                        </Text>
                    )}
                </div>
            </div>
        </div>
    );
}
