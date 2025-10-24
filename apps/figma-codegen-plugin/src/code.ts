/**
 * Figma Codegen Plugin 실행 확인을 위한 코드입니다.
 * 이 파일은 실제 코드 생성 로직 작업시에 제거될 예정입니다.
 */

if (figma.editorType === 'dev' && figma.mode === 'codegen') {
    figma.codegen.on('generate', ({ node, language }) => {
        try {
            return generateCodeForNode(node, language);
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

function generateCodeForNode(node: SceneNode, _language?: string): CodegenResult[] {
    const results: CodegenResult[] = [];

    results.push({
        title: 'React Component',
        language: 'JAVASCRIPT',
        code: generateReactComponent(node),
    });

    return results;
}

function generateReactComponent(node: SceneNode): string {
    const componentName = toPascalCase(node.name);

    return `import React from 'react';
import { ${componentName}Props } from './${componentName}.types';
import styles from './${componentName}.module.css';

export const ${componentName}: React.FC<${componentName}Props> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div 
      className={\`\${styles.${toCamelCase(node.name)}} \${className || ''}\`}
      {...props}
    >
      {children}
    </div>
  );
};

export default ${componentName};`;
}

function toPascalCase(str: string): string {
    return str
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .split(' ')
        .filter((word) => word.length > 0)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

function toCamelCase(str: string): string {
    const pascalCase = toPascalCase(str);
    return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
}
