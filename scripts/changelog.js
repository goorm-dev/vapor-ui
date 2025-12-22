import { getInfo, getInfoFromPullRequest } from '@changesets/get-github-info';
import { config } from 'dotenv';

config();

function readEnv() {
    const GITHUB_SERVER_URL = process.env.GITHUB_SERVER_URL || 'https://github.com';
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    return { GITHUB_SERVER_URL, GITHUB_TOKEN };
}

const changelogFunctions = {
    getReleaseLine: async (changeset, type, options) => {
        const { GITHUB_SERVER_URL, GITHUB_TOKEN } = readEnv();
        if (!options || !options.repo) {
            throw new Error(
                'Please provide a repo to this changelog generator like this:\n"changelog": ["@changesets/changelog-github", { "repo": "org/repo" }]',
            );
        }

        let prFromSummary;
        let commitFromSummary;
        let usersFromSummary = [];
        let scopeFromPR = '';

        const replacedChangelog = changeset.summary
            .replace(/^\s*(?:pr|pull|pull\s+request):\s*#?(\d+)/im, (_, pr) => {
                let num = Number(pr);
                if (!isNaN(num)) prFromSummary = num;
                return '';
            })
            .replace(/^\s*commit:\s*([^\s]+)/im, (_, commit) => {
                commitFromSummary = commit;
                return '';
            })
            .replace(/^\s*(?:author|user):\s*@?([^\s]+)/gim, (_, user) => {
                usersFromSummary.push(user);
                return '';
            })
            .trim();

        const [firstLine, ...futureLines] = replacedChangelog.split('\n').map((l) => l.trimRight());

        const links = await (async () => {
            if (prFromSummary !== undefined) {
                let { links } = await getInfoFromPullRequest({
                    repo: options.repo,
                    pull: prFromSummary,
                });

                if (commitFromSummary) {
                    const shortCommitId = commitFromSummary.slice(0, 7);
                    links = {
                        ...links,
                        commit: `[\`${shortCommitId}\`](${GITHUB_SERVER_URL}/${options.repo}/commit/${commitFromSummary})`,
                    };
                }
                return links;
            }
            const commitToFetchFrom = commitFromSummary || changeset.commit;
            if (commitToFetchFrom) {
                let { links } = await getInfo({
                    repo: options.repo,
                    commit: commitToFetchFrom,
                });
                return links;
            }
            return {
                commit: null,
                pull: null,
                user: null,
            };
        })();

        const prNumber = links.pull ? Number(links.pull.match(/#(\d+)/)?.[1]) : null;

        if (prNumber && GITHUB_TOKEN) {
            try {
                const response = await fetch(
                    `https://api.github.com/repos/${options.repo}/pulls/${prNumber}`,
                    {
                        headers: {
                            Authorization: `token ${GITHUB_TOKEN}`,
                            Accept: 'application/vnd.github.v3+json',
                        },
                    },
                );
                if (response.ok) {
                    const { title } = await response.json();
                    // "feat(Scope): description" 패턴 추출
                    const scopeMatch = title.match(/^\w+\(([^)]+)\):/);
                    if (scopeMatch) {
                        scopeFromPR = scopeMatch[1];
                    }
                }
            } catch (e) {
                console.error('Scope fetch failed:', e);
            }
        }

        const users = usersFromSummary?.length
            ? usersFromSummary
                  .map(
                      (userFromSummary) =>
                          `[@${userFromSummary}](${GITHUB_SERVER_URL}/${userFromSummary})`,
                  )
                  .join(', ')
            : links.user;

        const suffix = [
            links.pull === null ? '' : ` (${links.pull})`,
            users === null ? '' : ` - Thanks ${users}!`,
        ].join('');

        // Include scope information in the output using a special marker
        const scopeInfo = scopeFromPR ? `[SCOPE:${scopeFromPR}]` : '[SCOPE:ETC]';

        return `\n\n${scopeInfo}- ${firstLine}${suffix}\n${futureLines
            .map((l) => `  ${l}`)
            .join('\n')}`;
    },

    // same as default implementation
    getDependencyReleaseLine: async (changesets, dependenciesUpdated, options) => {
        if (!options.repo) {
            throw new Error(
                'Please provide a repo to this changelog generator like this:\n"changelog": ["@changesets/changelog-github", { "repo": "org/repo" }]',
            );
        }
        if (dependenciesUpdated.length === 0) return '';

        const scopeInfo = '[SCOPE:Updated Dependencies]';

        const changesetLink = `- [${(
            await Promise.all(
                changesets.map(async (cs) => {
                    if (cs.commit) {
                        let { links } = await getInfo({
                            repo: options.repo,
                            commit: cs.commit,
                        });
                        return links.commit;
                    }
                }),
            )
        )
            .filter((_) => _)
            .join(', ')}]:`;

        const updatedDepenenciesList = dependenciesUpdated.map(
            (dependency) => `    - ${dependency.name}@${dependency.newVersion}`,
        );

        return [scopeInfo, changesetLink, ...updatedDepenenciesList].join('\n');
    },
};

export default changelogFunctions;
