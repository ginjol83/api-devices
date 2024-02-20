const config = async (app) => {
    const CONFIG_ENVS = {
        production: './production.js',
        development: './development.js',
        test: './test.js'
    };

    const envConfigPath = CONFIG_ENVS[app.get('env')];
    if (!envConfigPath) {
        throw new Error(`No configuration found for environment: ${app.get('env')}`);
    }
    
    const module = await import(envConfigPath);
    return module.default;
};

export default config;