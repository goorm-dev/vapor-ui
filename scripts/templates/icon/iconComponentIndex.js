export default (name) => `
import ${name} from './${name}';

export default ${name};
`;
