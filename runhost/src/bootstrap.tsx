import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { FederationHost, FederationRuntimePlugin, init, loadRemote } from "@module-federation/enhanced/runtime";
import { Remote, RemoteInfo, ShareInfos } from "@module-federation/runtime/dist/src/type/index";
import { ModuleInfo } from "@module-federation/sdk/dist/src/types/index";

interface FederationRuntimeOptions {
  id?: string;
  name: string;
  version?: string;
  remotes: Array<Remote>;
  shared: ShareInfos;
  plugins: Array<FederationRuntimePlugin>;
  inBrowser: boolean;
}

type AfterResolveOptions = {
  id: string;
  pkgNameOrAlias: string;
  expose: string;
  remote: Remote;
  options: FederationRuntimeOptions;
  origin: FederationHost;
  remoteInfo: RemoteInfo;
  remoteSnapshot?: ModuleInfo;
};

type BeforeRequestOptions = {
  id: string;
  options: FederationRuntimeOptions;
  origin: FederationHost;
};

type InitOptions = {
  options: FederationRuntimeOptions;
  origin: FederationHost;
};

const getHostName = (name: string, remotes: any[]) => {
  const remote = remotes.find(r => r.name === name);
  const url = new URL(remote.url).hostname;
  const hasManifest = remote.entry.includes('manifest');
  console.log('url', url);
  console.log('remote', remote);

  return { hasManifest, url, remote };
};

const runtimePlugin = (remotes: any): FederationRuntimePlugin => {
  return {
    name: "my-runtime-plugin",
      handlePreloadModule(args) {
      console.log('handlePreloadModule: ', args);
      // const newRemote = getRemotePath(args.name, window.location.hostname);
      const { hasManifest, url: newHostName, remote } = getHostName(args.name, remotes);
      if (hasManifest) {
        args.remote.entry = remote.url + '/mf-manifest.json';
        args.remoteSnapshot.publicPath = `${remote.url}`;
      }
    },
    errorLoadRemote(args) {
      console.log('errorLoadRemote: ', args);
    },
    afterResolve(args) {
      console.log('afterResolve: ', args);
      console.log('remotes', remotes);
      if (args.remoteInfo.entry.includes('mf-manifest.json')) {
        args.remoteInfo.entry = args.remoteInfo.entry.replace('mf-manifest.json', 'remoteEntry.js');
      }
      return args;
    },
    beforeLoadRemoteSnapshot(args) {
      console.log('beforeLoadRemoteSnapshot: ', args);
      return args;
    },
    // handlePreloadModule(args) {
    //   if (showLogs) console.log('handlepreload', args);
    //   return args;
    // },
    onLoad(args) {
      // if (args.exposeModule.register) {
      // args.exposeModule.register(runtime).then(() => {
      // const [remoteName, entry] = args.id.split('/');
      // remoteStore.setRemoteReady(remoteName, entry);
      // });
      // }
      return args;
    },

  };
};

export async function renderApp() {
  const remotes = [{name: "app_02", entry: "mf-manifest.json", url: "http://localhost:3001", 'alias': 'a2'}];
  init({
    name: 'runhost',
    remotes: remotes.map(r => ({
      name: r.name,
      alias: r.alias,
      entry: `${r.url}/${r.entry ?? 'remoteEntry.js'}?v=${new Date().getTime()}`,
      //shared, // do we even need this?
    })),
    // plugins: [runtimePlugin(remotes)],
    plugins: [],
  });


  loadRemote("app_02/pi").then((module) => {
    console.log("results from pi in app02: ", (module as any).default());
  });
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
