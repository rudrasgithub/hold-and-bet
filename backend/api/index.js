// This file re-exports the compiled Express app for Vercel serverless
// The actual app is compiled to dist/src/index.js by the vercel-build command
const app = require('../dist/src/index.js').default;

module.exports = app;
