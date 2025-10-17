// Figma Codegen Plugin for Vapor UI
// This plugin generates code snippets from Figma designs

// Check if we're in dev mode and running codegen
if (figma.editorType === 'dev' && figma.mode === 'codegen') {
  // Register a callback to the "generate" event
  figma.codegen.on('generate', ({ node, language }) => {
    try {
      return generateCodeForNode(node, language);
    } catch (error) {
      console.error('Code generation error:', error);
      return [{
        title: 'Error',
        language: 'PLAINTEXT',
        code: `Error generating code: ${error instanceof Error ? error.message : 'Unknown error'}`
      }];
    }
  });
}

function generateCodeForNode(node: SceneNode, language?: string): CodegenResult[] {
  const results: CodegenResult[] = [];

  // Generate React component code
  results.push({
    title: 'React Component',
    language: 'JAVASCRIPT',
    code: generateReactComponent(node)
  });

  // Generate TypeScript types
  results.push({
    title: 'TypeScript Types',
    language: 'TYPESCRIPT',
    code: generateTypeScript(node)
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

function generateTypeScript(node: SceneNode): string {
  const componentName = toPascalCase(node.name);
  
  return `import { ReactNode, HTMLAttributes } from 'react';

export interface ${componentName}Props extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}`;
}


// Utility functions
function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function toCamelCase(str: string): string {
  const pascalCase = toPascalCase(str);
  return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
}