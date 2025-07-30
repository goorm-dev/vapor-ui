module.exports = (name) => `
import ${name} from './${name}';

export default ${name};
`;
