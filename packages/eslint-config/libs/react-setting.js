/** @type {Record<string, unknown>} */
export const settings = {
    react: {
        version: 'detect',
        formComponents: ['Form'],
        linkComponents: [
            {
                name: 'Link',
                linkAttribute: 'to',
            },
            {
                name: 'NavLink',
                linkAttribute: 'to',
            },
        ],
    },
};

export default settings;
