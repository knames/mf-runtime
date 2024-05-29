import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';

const publicPathPlugin: () => FederationRuntimePlugin = function () {
  return {
    name: 'public-path-plugin',
    beforeInit(args) {
      console.log('publicPathPlugin args: ', args);
      let newPublicPath;
      const snapshotManifestLoading = Object.keys(args.origin.snapshotHandler.manifestLoading)[0];
      if (snapshotManifestLoading) {
        newPublicPath = new URL(snapshotManifestLoading).origin + '/';
      } else {
        newPublicPath = window.location.origin + '/';
      }
      console.log('newPublicPath, ', newPublicPath);

      __webpack_require__.p = newPublicPath;

      return args;
    },
  };
};
export default publicPathPlugin;
