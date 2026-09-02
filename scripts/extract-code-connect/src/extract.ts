import type { Block, Spec, TreeNode } from './model';
import { isNamedInstance, isParen, lowerFirst, stripParens } from './naming';

export interface ExtractOptions {
    warn?: (msg: string) => void;
}

/**
 * ComponentTree → Block[].
 *
 * 규칙:
 * 1. 이름이 영문자/'(' 로 시작하지 않는 인스턴스는 하위까지 스킵.
 * 2. `(Name)` 인스턴스 → 블록. 괄호 속성 제외, SLOT 은 항상 `children`.
 * 3. 비괄호 인스턴스 → 가장 가까운 괄호 조상 블록에 `kind: 'instance'`. 하위 탐색 중단.
 * 4. 루트 직속 비괄호 인스턴스 → warn 후 스킵.
 */
export function extract(
    root: TreeNode,
    { warn = (msg) => console.warn(msg) }: ExtractOptions = {},
): Block[] {
    const blocks: Block[] = [];
    const varNames = new Set<string>();

    const visit = (node: TreeNode, parentBlock: Block | null): void => {
        for (const child of node.children) {
            if (!isNamedInstance(child.name)) continue;

            if (isParen(child.name)) {
                const block = toBlock(child);
                if (varNames.has(block.varName)) {
                    throw new Error(`Duplicate block name '${block.varName}' from '${child.name}'`);
                }
                varNames.add(block.varName);
                blocks.push(block);
                visit(child, block);
                continue;
            }

            if (!parentBlock) {
                warn(
                    `Skip root-level instance '${child.name}': no parenthesized parent to attach to`,
                );
                continue;
            }
            addEntry(parentBlock, lowerFirst(child.name), { kind: 'instance', name: child.name });
        }
    };

    visit(root, null);
    return blocks;
}

function toBlock(node: TreeNode): Block {
    const block: Block = {
        varName: lowerFirst(stripParens(node.name)),
        instanceName: node.name,
        entries: {},
        todos: [],
    };

    for (const prop of node.props) {
        if (prop.type === 'SLOT') {
            addEntry(block, 'children', { kind: 'slot', name: prop.name });
            continue;
        }
        if (isParen(prop.name)) continue;

        switch (prop.type) {
            case 'TEXT':
                addEntry(block, prop.name, { kind: 'string', name: prop.name });
                break;
            case 'BOOLEAN':
                addEntry(block, prop.name, { kind: 'boolean', name: prop.name });
                break;
            case 'VARIANT': {
                const options = prop.variantOptions ?? [];
                if (options.length === 0) {
                    throw new Error(`No variant options for '${prop.name}' in '${node.name}'`);
                }
                addEntry(block, prop.name, { kind: 'enum', name: prop.name, options });
                break;
            }
            case 'INSTANCE_SWAP':
                block.todos.push(prop.name);
                break;
        }
    }
    return block;
}

function addEntry(block: Block, key: string, spec: Spec): void {
    if (key in block.entries) {
        throw new Error(`Duplicate key '${key}' in block '${block.instanceName}'`);
    }
    block.entries[key] = spec;
}
