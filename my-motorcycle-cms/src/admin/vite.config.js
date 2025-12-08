import { mergeConfig } from 'vite';

export default (config) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      host: true,
      allowedHosts: [
        'cms.projectnetworks.co.uk',
        'localhost',
        '.projectnetworks.co.uk',
        'photos.benfoggon.com',
        'benfoggon.com'
      ]
    },
    preview: {
      host: true,
      allowedHosts: [
        'cms.projectnetworks.co.uk',
        'localhost',
        '.projectnetworks.co.uk',
        'photos.benfoggon.com',
        'benfoggon.com'
      ]
    }
  });
};
