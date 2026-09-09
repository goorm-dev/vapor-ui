export default (name: string) => `
import ${name} from './${name}';

export default ${name};
`;
