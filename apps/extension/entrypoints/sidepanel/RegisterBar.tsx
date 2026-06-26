import { useEffect, useState } from 'react';

import { Button, Callout, HStack, Select, Text, VStack } from '@vapor-ui/core';

import { clearImages } from '~/utils/data/image-store';
import { clearItems } from '~/utils/data/session-store';
import type { QaItem } from '~/utils/data/session-store';
import { createIssue, listTeams } from '~/utils/linear';
import type { LinearTeam } from '~/utils/linear';
import { buildDescription, buildTitle } from '~/utils/linear/build-issue';

interface RegisterBarProps {
    apiKey: string;
    items: QaItem[];
}

type Result =
    | { kind: 'success'; url: string; identifier: string }
    | { kind: 'error'; message: string };

export const RegisterBar = ({ apiKey, items }: RegisterBarProps) => {
    const [teams, setTeams] = useState<LinearTeam[]>([]);
    const [teamId, setTeamId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<Result>();

    useEffect(() => {
        let active = true;
        // 키가 바뀌면 옛 자격증명의 팀 선택을 즉시 비운다 — 안 그러면 새 목록을
        // 불러오는 동안 사용자가 이전 키의 팀으로 제출할 수 있다.
        setTeams([]);
        setTeamId('');
        void listTeams(apiKey)
            .then((next) => {
                if (!active) return;
                setTeams(next);
                if (next.length === 1) setTeamId(next[0].id);
            })
            .catch((error) => {
                if (!active) return;
                setResult({
                    kind: 'error',
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Linear 팀 목록을 불러오지 못했습니다.',
                });
            });
        return () => {
            active = false;
        };
    }, [apiKey]);

    const register = async () => {
        if (!teamId || items.length === 0) return;
        setSubmitting(true);
        setResult(undefined);

        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            const meta = { url: tab?.url, title: tab?.title };

            const issue = await createIssue(apiKey, {
                teamId,
                title: buildTitle(items, meta),
                description: await buildDescription(items, meta),
            });

            setResult({ kind: 'success', url: issue.url, identifier: issue.identifier });

            // 이슈 생성은 이미 성공했다. 로컬 정리 실패를 생성 실패로 표시하면
            // 사용자가 재시도해 중복 이슈를 만들 수 있으므로 best-effort로 끝낸다.
            const cleanup = await Promise.allSettled([clearItems(), clearImages()]);
            for (const result of cleanup) {
                if (result.status === 'rejected') console.error(result.reason);
            }
        } catch (e) {
            setResult({
                kind: 'error',
                message: e instanceof Error ? e.message : '등록에 실패했습니다.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (result?.kind === 'success') {
        return (
            <Callout.Root colorPalette="success">
                <VStack $css={{ gap: '$050' }}>
                    <Text typography="body2">등록 완료: {result.identifier}</Text>
                    <a href={result.url} target="_blank" rel="noreferrer">
                        <Text typography="body2" foreground="primary-200">
                            Linear에서 보기
                        </Text>
                    </a>
                </VStack>
            </Callout.Root>
        );
    }

    return (
        <VStack $css={{ gap: '$150' }}>
            {result?.kind === 'error' && (
                <Callout.Root colorPalette="danger">
                    <Text typography="body2">{result.message}</Text>
                </Callout.Root>
            )}

            <HStack $css={{ gap: '$100', alignItems: 'end' }}>
                <Select.Root
                    placeholder="팀 선택"
                    items={teams.map((t) => ({ value: t.id, label: t.name }))}
                    value={teamId}
                    onValueChange={(value) => setTeamId(value ?? '')}
                >
                    <Select.Trigger />
                    <Select.Popup>
                        {teams.map((t) => (
                            <Select.Item key={t.id} value={t.id}>
                                {t.name}
                            </Select.Item>
                        ))}
                    </Select.Popup>
                </Select.Root>

                <Button
                    disabled={!teamId || items.length === 0 || submitting}
                    onClick={() => void register()}
                >
                    {submitting ? '등록 중...' : `Linear에 등록 (${items.length})`}
                </Button>
            </HStack>
        </VStack>
    );
};
