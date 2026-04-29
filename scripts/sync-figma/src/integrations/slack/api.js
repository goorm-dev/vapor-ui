const sendWebhookMessage = async (webhookUrl, payload) => {
    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Slack webhook error: ${response.status} ${response.statusText}`);
    }
};

export { sendWebhookMessage };
