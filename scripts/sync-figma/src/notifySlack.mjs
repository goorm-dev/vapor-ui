/**
 * Slack 알림 스크립트
 *
 * GitHub Actions 워크플로우 실패 시 Slack 채널로 알림을 전송합니다.
 *
 * 환경 변수:
 *   - SLACK_GDS_ALARM_WEBHOOK_URL: Slack Incoming Webhook URL
 *   - WORKFLOW_STATUS: 워크플로우 상태 (success, failure)
 *   - GITHUB_REPOSITORY: GitHub 저장소 (owner/repo)
 *   - GITHUB_RUN_ID: GitHub Actions 실행 ID
 *   - GITHUB_RUN_NUMBER: GitHub Actions 실행 번호
 *   - GITHUB_REF_NAME: 브랜치 이름
 */
import process from 'node:process';

const {
    SLACK_GDS_ALARM_WEBHOOK_URL,
    WORKFLOW_STATUS,
    GITHUB_REPOSITORY,
    GITHUB_RUN_ID,
    GITHUB_RUN_NUMBER,
    GITHUB_REF_NAME,
} = process.env;

if (!SLACK_GDS_ALARM_WEBHOOK_URL) {
    console.error('❌ 오류: SLACK_GDS_ALARM_WEBHOOK_URL 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
}

const statusEmoji = WORKFLOW_STATUS === 'success' ? '✅' : '❌';
const statusText = WORKFLOW_STATUS === 'success' ? '성공' : '실패';
const statusColor = WORKFLOW_STATUS === 'success' ? '#36a64f' : '#ff0000';

const message = {
    text: `🤖 Figma 아이콘 동기화 워크플로우 ${statusText}`,
    attachments: [
        {
            color: statusColor,
            title: `🤖 Figma 아이콘 동기화 워크플로우 ${statusText}`,
            title_link: `https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`,
            fields: [
                {
                    title: '상태',
                    value: `${statusEmoji} ${statusText}`,
                    short: true,
                },
                {
                    title: '저장소',
                    value: `<https://github.com/${GITHUB_REPOSITORY}|${GITHUB_REPOSITORY}>`,
                    short: true,
                },
                {
                    title: '브랜치',
                    value: GITHUB_REF_NAME || 'Unknown',
                    short: true,
                },
                {
                    title: '실행 번호',
                    value: `<https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}|#${GITHUB_RUN_NUMBER}>`,
                    short: true,
                },
            ],
            footer: 'Vapor UI - Figma 동기화',
            ts: Math.floor(Date.now() / 1000),
        },
    ],
};

try {
    const response = await fetch(SLACK_GDS_ALARM_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });

    if (!response.ok) {
        const body = await response.text();
        console.error(`❌ Slack 알림 전송 실패: ${response.status} ${response.statusText}`);
        console.error(`응답 본문: ${body}`);
        process.exit(1);
    }

    console.log('✅ Slack 알림이 성공적으로 전송되었습니다.');
} catch (error) {
    console.error('❌ Slack 알림 전송 중 오류 발생:', error.message);
    process.exit(1);
}
