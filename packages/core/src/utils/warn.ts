const warned = new Set<string>();

/**
 * Logs a development-only warning, at most once per distinct message.
 *
 * Guard the call site with `process.env.NODE_ENV !== 'production'` so bundlers
 * can drop the message construction from production builds.
 */
export const warn = (message: string) => {
    if (process.env.NODE_ENV === 'production' || warned.has(message)) return;

    warned.add(message);
    console.warn(`Vapor UI: ${message}`);
};
