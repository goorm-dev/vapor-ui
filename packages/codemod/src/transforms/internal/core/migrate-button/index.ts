import type { API, FileInfo } from 'jscodeshift';

function transform(file: FileInfo, api: API) {
    const j = api.jscodeshift;
    const root = j(file.source);

    // 'vapor-ui/core'에서 'Button' 컴포넌트의 로컬 import 이름을 찾는 함수
    const getButtonComponentLocalName = () => {
        let localName = null;

        root.find(j.ImportDeclaration, {
            source: { value: '@vapor-ui/core' },
        }).forEach((path) => {
            path.node.specifiers?.forEach((specifier) => {
                if (j.ImportSpecifier.check(specifier) && specifier.imported.name === 'Button') {
                    // import { Button } from '...' 또는 import { Button as MyButton } from '...'
                    localName = specifier.local.name;
                }
            });
        });

        return localName;
    };

    const buttonComponentLocalName = getButtonComponentLocalName();

    // 'vapor-ui/core'에서 Button을 import하지 않았다면, 아무 작업도 수행하지 않습니다.
    if (!buttonComponentLocalName) {
        return file.source;
    }

    // 1. <Button> 컴포넌트를 찾습니다 (import된 로컬 이름 기준).
    root.find(j.JSXOpeningElement, { name: { name: buttonComponentLocalName } }).forEach((path) => {
        // 2. 'shape' 라는 이름의 prop을 찾습니다.
        const shapeAttribute = j(path).find(j.JSXAttribute, {
            name: { name: 'shape' },
        });

        // 'shape' prop이 존재할 경우에만 변환을 실행합니다.
        if (shapeAttribute.length > 0) {
            shapeAttribute.forEach((attrPath) => {
                // 3. prop의 이름을 'shape'에서 'variant'로 변경합니다.
                attrPath.node.name.name = 'variant';

                const propValue = attrPath.node.value;

                // 4. prop의 값이 문자열 리터럴 "invisible"인 경우 "ghost"로 변경합니다.
                // 예: shape="invisible"
                if (j.StringLiteral.check(propValue) && propValue.value === 'invisible') {
                    attrPath.node.value = j.stringLiteral('ghost');
                }

                // 5. prop의 값이 JSX 표현식인 경우도 처리합니다.
                // 예: shape={'invisible'}
                if (
                    j.JSXExpressionContainer.check(propValue) &&
                    j.StringLiteral.check(propValue.expression) &&
                    propValue.expression.value === 'invisible'
                ) {
                    propValue.expression.value = 'ghost';
                }

                // "fill", "outline" 값은 이름만 변경되고 값은 그대로 유지됩니다.
            });
        }
    });

    return root.toSource();
}

export default transform;
export const parser = 'tsx';
