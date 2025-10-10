module.exports = {
    apps: [
      {
        name: 'tsugu-backend',
        script: 'npx',
        args: 'ts-node --transpile-only -r tsconfig-paths/register src/app.ts',
        interpreter: 'none',
        exec_mode: 'fork',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '2G',
        out_file: 'logs/out.log',
        error_file: 'logs/error.log',
      },
    ]
}
