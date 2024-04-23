import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';


const runtimePlugin: () => FederationRuntimePlugin = function () {
    return {
        name: 'my-remote-plugin',
        beforeInit(args) {
            console.log({args})
            __webpack_require__.p = 'http://localhost:3001/';
            return args;
        },
    };
};
export default runtimePlugin;