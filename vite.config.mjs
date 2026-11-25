import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'three-vendor',
              test: /node_modules[\\/]three[\\/]/,
              minSize: 100000,
              maxSize: 250000,
              priority: 10
            }
          ]
        }
      }
    }
  }
});
