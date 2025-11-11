/**
 * Figma Codegen Plugin Entry Point
 *
 * Figma Codegen Panel에서 실행되는 메인 코드
 */

import { createTranspiler } from './transpiler';
import type { FigmaNode } from './domain/types';

// Figma Codegen Panel에서만 실행
if (figma.editorType === 'dev' && figma.mode === 'codegen') {
    figma.codegen.on('generate', async ({ node }) => {
        try {
            return await generateCodeForNode(node);
        } catch (error) {
            console.error('Code generation error:', error);
            return [
                {
                    title: 'Error',
                    language: 'PLAINTEXT',
                    code: `Error generating code: ${error instanceof Error ? error.message : 'Unknown error'}`,
                },
            ];
        }
    });
}

/**
 * Figma 노드에 대한 코드 생성
 */
async function generateCodeForNode(node: SceneNode): Promise<CodegenResult[]> {
    const results: CodegenResult[] = [];

    try {
        // Transpiler 생성
        const transpiler = await createTranspiler({
            componentName: 'GeneratedComponent',
            format: true,
        });

        // Figma 노드를 FigmaNode 타입으로 변환
        const figmaNode = await convertToFigmaNode(node);

        // React 코드 생성
        const code = await transpiler.transpile(figmaNode);

        results.push({
            title: 'React Component (Vapor-UI)',
            language: 'JAVASCRIPT',
            code,
        });

        // 디버깅용: Raw IR 출력
        const rawIR = transpiler.toRawIR(figmaNode);
        if (rawIR) {
            results.push({
                title: 'Debug: Raw IR',
                language: 'JSON',
                code: JSON.stringify(rawIR, null, 2),
            });
        }

        // 디버깅용: Semantic IR 출력
        const semanticIR = transpiler.toSemanticIR(figmaNode);
        if (semanticIR) {
            // Set을 배열로 변환하여 JSON 직렬화 가능하게
            const serializedIR = {
                ...semanticIR,
                imports: Array.from(semanticIR.imports),
            };

            results.push({
                title: 'Debug: Semantic IR',
                language: 'JSON',
                code: JSON.stringify(serializedIR, null, 2),
            });
        }
    } catch (error) {
        throw new Error(
            `Failed to generate code: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
    }

    return results;
}

/**
 * Figma SceneNode를 FigmaNode 타입으로 변환
 *
 * Figma Plugin API의 노드를 transpiler가 이해할 수 있는 형태로 변환
 */
async function convertToFigmaNode(node: SceneNode): Promise<FigmaNode> {
    const baseNode: FigmaNode = {
        id: node.id,
        name: node.name,
        type: node.type as FigmaNode['type'],
        visible: node.visible,
    };

    // Children 처리 (비동기)
    if ('children' in node) {
        baseNode.children = await Promise.all(node.children.map(convertToFigmaNode));
    }

    // Instance 속성 (비동기 API 사용)
    if (node.type === 'INSTANCE') {
        const instanceNode = node as InstanceNode;
        baseNode.componentProperties = instanceNode.componentProperties as any;

        // Codegen Panel에서는 getMainComponentAsync 사용 필수
        const mainComponent = await instanceNode.getMainComponentAsync();
        baseNode.mainComponent = mainComponent
            ? {
                  id: mainComponent.id,
                  name: mainComponent.name,
                  key: mainComponent.key,
              }
            : undefined;
    }

    // Layout 속성 (AutoLayout)
    if ('layoutMode' in node) {
        const layoutNode = node as FrameNode;
        baseNode.layoutMode = layoutNode.layoutMode;
        baseNode.primaryAxisAlignItems = layoutNode.primaryAxisAlignItems;
        baseNode.counterAxisAlignItems = layoutNode.counterAxisAlignItems;
        baseNode.itemSpacing = layoutNode.itemSpacing;
        baseNode.paddingLeft = layoutNode.paddingLeft;
        baseNode.paddingRight = layoutNode.paddingRight;
        baseNode.paddingTop = layoutNode.paddingTop;
        baseNode.paddingBottom = layoutNode.paddingBottom;
    }

    // Dimension 속성
    if ('width' in node) {
        baseNode.width = node.width;
        baseNode.height = node.height;
    }

    // Style 속성
    if ('fills' in node) {
        baseNode.fills = node.fills as any;
    }

    if ('strokes' in node) {
        baseNode.strokes = node.strokes as any;
    }

    if ('effects' in node) {
        baseNode.effects = node.effects as any;
    }

    if ('opacity' in node) {
        baseNode.opacity = node.opacity;
    }

    if ('cornerRadius' in node) {
        baseNode.cornerRadius = node.cornerRadius as number;
    }

    // Text 속성
    if (node.type === 'TEXT') {
        const textNode = node as TextNode;
        baseNode.characters = textNode.characters;
        baseNode.fontSize = textNode.fontSize as number;
        baseNode.fontWeight = textNode.fontWeight as number;
        baseNode.lineHeight = textNode.lineHeight as any;
        baseNode.textAlignHorizontal = textNode.textAlignHorizontal;
    }

    return baseNode;
}
