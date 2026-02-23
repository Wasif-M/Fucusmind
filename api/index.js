// Vercel serverless function entry point
import('../dist/index.cjs').then(module => {
  module.default || module;
}).catch(err => {
  console.error('Failed to load server:', err);
});
