import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';

const runtimePlugin: () => FederationRuntimePlugin = function () {
    return {
        name: 'my-runtime-plugin',
        beforeInit(args) {
            console.log('beeeeeeep: ', args);
            console.log(__webpack_require__.p)
            console.log('where am i ? : ', window.location.hostname)
            console.log('wl: ', window.location)
            __webpack_require__.p = __webpack_require__.p.replace('placeholder', window.location.hostname);
            // __webpack_require__.p = 'http://localhost:3001/';
            return args;
        },
        beforeRequest(args) {
            console.log('beforeRequest: ', args);
            return args;
        },
        afterResolve(args) {
            console.log('afterResolve', args);
            return args;
        },
        onLoad(args) {
            console.log('onLoad: ', args);
            return args;
        },
        async loadShare(args) {
            console.log('loadShare:', args);
        },
        async beforeLoadShare(args) {
            console.log('beforeloadShare:', args);
            return args;
        },
    };
};
export default runtimePlugin;