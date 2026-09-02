import type { Block, Prop, Spec, TreeNode } from './model';
import { isNamedInstance, isParen, lowerFirst, stripParens } from './naming';

export interface ExtractOpts {
    warn?: (msg: string) => void;
}

export function extract(root: TreeNode, opts?: ExtractOpts): Block[] {
    const blocks: Block[] = [];
    const seen = new Set<string>();

    function traverse(node: TreeNode, parent: Block | null): void {
        // 인스턴스만 처리
        if (node.kind === 'ROOT') {
            // ROOT 직속 비괄호는 경고 후 스킵
            for (const child of node.children) {
                if (!isParen(child.name)) {
                    opts?.warn?.(`Skipping non-parenthesized root child '${child.name}'`);
                } else {
                    traverse(child, null);
                }
            }
            return;
        }

        // 이모지로 시작하면 스킵 (하위도 탐색하지 않음)
        if (!isNamedInstance(node.name)) {
            return;
        }

        // 괄호 인스턴스 = 블록
        if (isParen(node.name)) {
            const varName = lowerFirst(stripParens(node.name));

            // 중복 체크
            if (seen.has(varName)) {
                throw new Error(`Duplicate block varName '${varName}'`);
            }
            seen.add(varName);

            const block: Block = {
                varName,
                instanceName: node.name,
                entries: {},
                todos: [],
            };

            // 자체 속성 처리
            for (const prop of node.props) {
                processProp(block, prop);
            }

            blocks.push(block);

            // 하위 노드 탐색 (INSTANCE, 괄호 인스턴스 등)
            for (const child of node.children) {
                traverse(child, block);
            }
        } else {
            // 비괄호 인스턴스 = parent 블록에 instance 추가, 하위 탐색 안 함
            if (parent === null) {
                throw new Error(`Instance '${node.name}' has no parent block`);
            }
            addEntry(parent, lowerFirst(node.name), {
                kind: 'instance',
                name: node.name,
            });
        }
    }

    function processProp(block: Block, prop: Prop): void {
        // 괄호 속성은 제외 (정의만 읽음)
        if (isParen(prop.name)) {
            // SLOT 예외
            if (prop.type === 'SLOT') {
                addEntry(block, 'children', { kind: 'slot', name: prop.name });
            }
            return;
        }

        switch (prop.type) {
            case 'TEXT':
                addEntry(block, prop.name, { kind: 'string', name: prop.name });
                break;

            case 'BOOLEAN':
                addEntry(block, prop.name, { kind: 'boolean', name: prop.name });
                break;

            case 'SLOT':
                addEntry(block, prop.name, { kind: 'slot', name: prop.name });
                break;

            case 'VARIANT':
                if (!prop.variantOptions || prop.variantOptions.length === 0) {
                    throw new Error(`Prop '${prop.name}' in '${block.instanceName}' has no variant options`);
                }
                addEntry(block, prop.name, {
                    kind: 'enum',
                    name: prop.name,
                    options: prop.variantOptions,
                });
                break;

            case 'INSTANCE_SWAP':
                block.todos.push(prop.name);
                break;
        }
    }

    traverse(root, null);
    return blocks;
}

function addEntry(block: Block, key: string, spec: Spec): void {
    if (key in block.entries) {
        throw new Error(`Duplicate key '${key}' in block '${block.instanceName}'`);
    }

    block.entries[key] = spec;
}
