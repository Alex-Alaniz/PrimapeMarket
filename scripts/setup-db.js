
// Simple script to execute the database setup
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
  },
});

require('../src/lib/setup-db');
