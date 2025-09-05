import React from 'react';

import type { UserListItemProps } from './user-list-item';
import { UserListItem } from './user-list-item';

export interface User extends UserListItemProps {}

export interface UserListProps {
    users: User[];
}

export function UserList({ users }: UserListProps) {
    return (
        <ul className="w-full flex flex-col items-start gap-[var(--vapor-size-space-200)] self-stretch">
            {users.map((user, idx) => (
                <li className="w-full" key={idx}>
                    <UserListItem {...user} />
                </li>
            ))}
        </ul>
    );
}
