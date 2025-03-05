
// Simple script to execute the database setup
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
  },
});

require('../src/lib/setup-db');
