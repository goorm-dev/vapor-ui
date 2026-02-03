#!/usr/bin/env tsx
/**
 * Sprinkles 메타데이터 생성 스크립트
 *
 * 이 스크립트는 @vanilla-extract/sprinkles의 defineProperties 호출을 분석하여
 * 각 CSS prop이 디자인 토큰을 사용하는지 여부를 추출합니다.
 *
 * 생성된 메타데이터는 ts-api-extractor가 컴포넌트 props를 추출할 때
 * sprinkles props를 필터링하거나 토큰 정보를 문서화하는 데 사용됩니다.
 *
 * 실행 시점:
 * - `pnpm build` 전 (prebuild hook)
 * - `pnpm generate:sprinkles` 수동 실행
 *
 * 출력: generated/sprinkles-meta.json
 */
import fs from 'node:fs';
import path from 'node:path';
import {
    type ObjectLiteralExpression,
    Project,
    type PropertyAssignment,
    SyntaxKind,
} from 'ts-morph';

interface PropDefinition {
    usesToken: boolean;
    tokenPath?: string;
    cssProperty: string;
}

interface SprinklesMeta {
    tokenProps: string[];
    nonTokenProps: string[];
    propDefinitions: Record<string, PropDefinition>;
}

function getTokenPath(initializerName: string): string | undefined {
    const tokenMapping: Record<string, string> = {
        spaceTokens: 'vars.size.space',
        marginTokens: 'vars.size.space',
        dimensionTokens: 'vars.size.dimension',
        radiusTokens: 'vars.size.borderRadius',
        bgColorTokens: 'vars.color.background',
        colorTokens: 'vars.color.foreground',
        borderColorTokens: 'vars.color.border',
    };

    return tokenMapping[initializerName];
}

function analyzeSprinkles(sprinklesPath: string): SprinklesMeta {
    const project = new Project({
        skipFileDependencyResolution: true,
    });
    const sourceFile = project.addSourceFileAtPath(sprinklesPath);

    const meta: SprinklesMeta = {
        tokenProps: [],
        nonTokenProps: [],
        propDefinitions: {},
    };

    // Find defineProperties call
    const definePropertiesCall = sourceFile
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .find((call) => {
            const expr = call.getExpression();
            return expr.getText() === 'defineProperties';
        });

    if (!definePropertiesCall) {
        console.warn('defineProperties call not found');
        return meta;
    }

    // Get the configuration object
    const args = definePropertiesCall.getArguments();
    if (args.length === 0) {
        console.warn('defineProperties has no arguments');
        return meta;
    }

    const configObj = args[0] as ObjectLiteralExpression;
    if (!configObj.isKind(SyntaxKind.ObjectLiteralExpression)) {
        console.warn('First argument is not an object literal');
        return meta;
    }

    // Find dynamicProperties
    const dynamicPropsProperty = configObj.getProperty('dynamicProperties');
    if (!dynamicPropsProperty?.isKind(SyntaxKind.PropertyAssignment)) {
        console.warn('dynamicProperties not found');
        return meta;
    }

    const dynamicPropsObj = (dynamicPropsProperty as PropertyAssignment).getInitializer();
    if (!dynamicPropsObj?.isKind(SyntaxKind.ObjectLiteralExpression)) {
        console.warn('dynamicProperties is not an object');
        return meta;
    }

    // Analyze each property in dynamicProperties
    for (const prop of (dynamicPropsObj as ObjectLiteralExpression).getProperties()) {
        if (!prop.isKind(SyntaxKind.PropertyAssignment)) continue;

        const propAssignment = prop as PropertyAssignment;
        const propName = propAssignment.getName();
        const initializer = propAssignment.getInitializer();

        if (!initializer) continue;

        const initText = initializer.getText();
        const usesToken = initText !== 'true';

        meta.propDefinitions[propName] = {
            usesToken,
            tokenPath: usesToken ? getTokenPath(initText) : undefined,
            cssProperty: propName,
        };

        if (usesToken) {
            meta.tokenProps.push(propName);
        } else {
            meta.nonTokenProps.push(propName);
        }
    }

    // Handle shorthands
    const shorthandsProperty = configObj.getProperty('shorthands');
    if (shorthandsProperty?.isKind(SyntaxKind.PropertyAssignment)) {
        const shorthandsObj = (shorthandsProperty as PropertyAssignment).getInitializer();
        if (shorthandsObj?.isKind(SyntaxKind.ObjectLiteralExpression)) {
            for (const prop of (shorthandsObj as ObjectLiteralExpression).getProperties()) {
                if (!prop.isKind(SyntaxKind.PropertyAssignment)) continue;

                const propAssignment = prop as PropertyAssignment;
                const propName = propAssignment.getName();
                const arrayInit = propAssignment.getInitializer();

                if (!arrayInit?.isKind(SyntaxKind.ArrayLiteralExpression)) continue;

                // Get the expanded prop names
                const expandedProps = arrayInit.getElements().map((el) => {
                    const text = el.getText();
                    return text.replace(/['"]/g, '');
                });

                // Shorthand uses token if any of its expanded props use token
                const usesToken = expandedProps.some((p) => meta.propDefinitions[p]?.usesToken);
                const tokenPath = expandedProps.find((p) => meta.propDefinitions[p]?.tokenPath)
                    ? meta.propDefinitions[expandedProps[0]]?.tokenPath
                    : undefined;

                meta.propDefinitions[propName] = {
                    usesToken,
                    tokenPath,
                    cssProperty: propName,
                };

                if (usesToken) {
                    meta.tokenProps.push(propName);
                } else {
                    meta.nonTokenProps.push(propName);
                }
            }
        }
    }

    return meta;
}

// Main execution
const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const sprinklesPath = path.resolve(scriptDir, '../../../packages/core/src/styles/sprinkles.css.ts');
const outputDir = path.resolve(scriptDir, '../generated');
const outputPath = path.join(outputDir, 'sprinkles-meta.json');

if (!fs.existsSync(sprinklesPath)) {
    console.error(`Sprinkles file not found: ${sprinklesPath}`);
    process.exit(1);
}

const meta = analyzeSprinkles(sprinklesPath);

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(meta, null, 2));

console.log(`Generated sprinkles metadata:`);
console.log(`  Token props: ${meta.tokenProps.length}`);
console.log(`  Non-token props: ${meta.nonTokenProps.length}`);
console.log(`  Output: ${outputPath}`);
