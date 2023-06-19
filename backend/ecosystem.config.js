module.exports = {
    apps: [
      {
        name: 'tsugu-backend',
        script: 'ts-node',
        args: '--transpile-only .\\src\\app.ts',
        interpreter: 'none',
        exec_mode: 'fork',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
      },
    ]
}