// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { QaItem } from '~/utils/data/session-store';

import { RegisterBar } from './RegisterBar';

const mocks = vi.hoisted(() => ({
    buildDescription: vi.fn(),
    buildTitle: vi.fn(),
    clearImages: vi.fn(),
    clearItems: vi.fn(),
    createIssue: vi.fn(),
    listTeams: vi.fn(),
}));

vi.mock('~/utils/data/image-store', () => ({ clearImages: mocks.clearImages }));
vi.mock('~/utils/data/session-store', () => ({ clearItems: mocks.clearItems }));
vi.mock('~/utils/linear', () => ({
    createIssue: mocks.createIssue,
    listTeams: mocks.listTeams,
}));
vi.mock('~/utils/linear/build-issue', () => ({
    buildDescription: mocks.buildDescription,
    buildTitle: mocks.buildTitle,
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const item: QaItem = {
    id: 'item-1',
    selector: 'button',
    rect: { top: 0, left: 0, width: 10, height: 10 },
    memo: '메모',
    createdAt: 0,
};

describe('RegisterBar', () => {
    afterEach(() => {
        document.body.replaceChildren();
        vi.resetAllMocks();
    });

    it('shows the Linear error when teams cannot be loaded', async () => {
        mocks.listTeams.mockRejectedValue(new Error('팀 조회 실패'));
        const container = document.createElement('div');
        document.body.append(container);
        const root = createRoot(container);

        await act(async () => {
            root.render(<RegisterBar apiKey="key" items={[item]} />);
        });

        expect(container.textContent).toContain('팀 조회 실패');

        act(() => root.unmount());
    });

    it('keeps the created issue success when local cleanup fails', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        mocks.listTeams.mockResolvedValue([{ id: 'team-1', name: 'Team' }]);
        mocks.buildTitle.mockReturnValue('[QA] 테스트 — 1건');
        mocks.buildDescription.mockResolvedValue('description');
        mocks.createIssue.mockResolvedValue({
            id: 'issue-1',
            identifier: 'VAPOR-1',
            url: 'https://linear.app/issue/VAPOR-1',
        });
        mocks.clearItems.mockRejectedValue(new Error('스토리지 정리 실패'));
        mocks.clearImages.mockResolvedValue(undefined);
        const container = document.createElement('div');
        document.body.append(container);
        const root = createRoot(container);

        await act(async () => {
            root.render(<RegisterBar apiKey="key" items={[item]} />);
        });
        const registerButton = [...container.querySelectorAll('button')].find((button) =>
            button.textContent?.includes('Linear에 등록'),
        );

        await act(async () => {
            registerButton?.click();
        });

        expect(container.textContent).toContain('등록 완료: VAPOR-1');
        expect(consoleError).toHaveBeenCalledWith(expect.any(Error));

        act(() => root.unmount());
        consoleError.mockRestore();
    });
});
