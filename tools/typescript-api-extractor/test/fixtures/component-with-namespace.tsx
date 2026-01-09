export function Button() {
    return <button>Click</button>;
}

export namespace Button {
    export interface Props {
        disabled?: boolean;
    }
}

export function Input() {
    return <input />;
}

export namespace Input {
    export interface Props {
        value?: string;
    }
    export type ChangeEvent = { value: string };
}
