const config = async (app) => {
    const CONFIG_ENVS = {
        'production': './production.js',
        'development': './development.js',
        'test': './test.js'
    };

    const env = app.get('env');
    
    try {
        const module = await import(CONFIG_ENVS[env]);
        return module.default;
    } catch (error) {
        throw new Error(`Error al cargar la configuración para el entorno '${env}': ${error.message}`);
    }
};

export default config;