import { extractComponentTypesFromFile } from './type-extractor';
import * as path from 'path';

// 테스트 실행
async function testTypeExtraction() {
  const projectRoot = path.resolve(__dirname, '../../../');
  const configPath = path.join(projectRoot, 'tsconfig.json');
  const buttonFilePath = path.join(projectRoot, 'packages/core/src/components/button/button.tsx');

  console.log('프로젝트 루트:', projectRoot);
  console.log('TypeScript 설정 파일:', configPath);
  console.log('분석할 파일:', buttonFilePath);
  console.log('---');

  try {
    const components = extractComponentTypesFromFile(configPath, buttonFilePath);
    
    console.log(`발견된 컴포넌트 수: ${components.length}`);
    console.log('');

    components.forEach((component, index) => {
      console.log(`${index + 1}. 컴포넌트: ${component.name}`);
      console.log(`   Display Name: ${component.displayName || 'N/A'}`);
      console.log(`   설명: ${component.description || 'N/A'}`);
      console.log(`   Props 수: ${component.props.length}`);
      
      if (component.props.length > 0) {
        console.log('   Props:');
        component.props.forEach((prop) => {
          console.log(`     - ${prop.name}: ${prop.type}${prop.required ? ' (필수)' : ' (선택)'}`);
          if (prop.description) {
            console.log(`       설명: ${prop.description}`);
          }
          if (prop.defaultValue) {
            console.log(`       기본값: ${prop.defaultValue}`);
          }
        });
      }
      console.log('');
    });

  } catch (error) {
    console.error('타입 추출 중 오류 발생:', error);
  }
}

// 스크립트가 직접 실행될 때만 테스트 실행
if (require.main === module) {
  testTypeExtraction();
}

export { testTypeExtraction };