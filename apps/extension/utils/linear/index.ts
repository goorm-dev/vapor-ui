const ENDPOINT = 'https://api.linear.app/graphql';

interface GraphQLResponse<T> {
    data?: T;
    errors?: { message: string }[];
}

const gql = async <T>(key: string, query: string, variables?: object): Promise<T> => {
    const res = await fetch(ENDPOINT, {
        method: 'POST',
        // Linear Personal API Key는 Authorization 헤더에 값 그대로. Bearer 접두사 없음.
        headers: { 'Content-Type': 'application/json', Authorization: key },
        body: JSON.stringify({ query, variables }),
    });

    if (res.status === 401) throw new LinearAuthError();
    if (!res.ok) throw new Error(`Linear API ${res.status}`);

    const json = (await res.json()) as GraphQLResponse<T>;
    if (json.errors?.length) throw new Error(json.errors[0].message);
    if (!json.data) throw new Error('Linear API: empty response');
    return json.data;
};

export class LinearAuthError extends Error {
    constructor() {
        super('유효하지 않은 API 키입니다.');
        this.name = 'LinearAuthError';
    }
}

export interface LinearViewer {
    id: string;
    name: string;
}

export interface LinearTeam {
    id: string;
    name: string;
}

export const verifyKey = async (key: string): Promise<LinearViewer> => {
    const data = await gql<{ viewer: LinearViewer }>(key, `query { viewer { id name } }`);
    return data.viewer;
};

export const listTeams = async (key: string): Promise<LinearTeam[]> => {
    const data = await gql<{ teams: { nodes: LinearTeam[] } }>(
        key,
        `query { teams { nodes { id name } } }`,
    );
    return data.teams.nodes;
};

export interface CreatedIssue {
    id: string;
    identifier: string;
    url: string;
}

export const createIssue = async (
    key: string,
    input: { teamId: string; title: string; description: string },
): Promise<CreatedIssue> => {
    const data = await gql<{
        issueCreate: { success: boolean; issue: CreatedIssue };
    }>(
        key,
        `mutation IssueCreate($input: IssueCreateInput!) {
            issueCreate(input: $input) {
                success
                issue { id identifier url }
            }
        }`,
        // teamId만 주면 Triage가 켜진 팀은 자동으로 Triage 상태로 들어간다(stateId 생략).
        { input },
    );
    if (!data.issueCreate.success) throw new Error('이슈 생성에 실패했습니다.');
    return data.issueCreate.issue;
};
