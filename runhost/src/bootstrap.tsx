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

const runtimePlugin = (): FederationRuntimePlugin => {
  return {
    name: "my-runtime-plugin",
    beforeInit(args) {
      console.log("beforeInit: ", args);
      return args;
    },
    init(args: InitOptions) {
      return args;
    },
    async beforeRequest(args: BeforeRequestOptions): Promise<BeforeRequestOptions> {
      console.log("beforeRequest: ", args);
      // manifestCache isn't populated by this point
      // args.origin.snapshotHandler.manifestCache.forEach((value, key) => {
      //   console.log("manifestCache: ", key, value);
      // });
      return args;
    },

    loadRemoteSnapshot(args) {
      console.log("loadRemoteSnapshot: ", args);
      return args;
    },

    async afterResolve(args: AfterResolveOptions): Promise<AfterResolveOptions> {
      console.log("afterResolve", args);
      args.origin.snapshotHandler.manifestCache.forEach((value: any, key) => {
        console.log("manifestCache: ", key, value);
        if (value.metaData.publicPath.includes("placeholder")) {
          value.metaData.publicPath = value.metaData.publicPath.replace("placeholder", "localhost");
          console.log(value);
        }
      });
      if (args.remoteInfo.entry.includes("placeholder")) {
        args.remoteInfo.entry = args.remoteInfo.entry.replace("placeholder", "localhost");
      }

      console.log("args post replace: ", args);
      return args;
    },
    handlePreloadModule(args) {
      console.log("handlePreloadModule: ", args);
      // args.remote.entry = 'http://localhost:3001/mf-manifest.json';
      args.remoteSnapshot.publicPath = "http://localhost:3001/";
      // console.log('newArgs: ', args);
      return args;
    },
    onLoad(args) {
      console.log("onLoad: ", args);
      return args;
    },

    async initContainer(args) {
      console.log("initcontainer: ", args);
      return args;
    },
    // async loadShare(args) {
    //   console.log("loadShare:", args);
    //   return args;
    // },
    async beforeLoadShare(args) {
      console.log("beforeloadShare:", args);
      return args;
    },
  };
};

export async function renderApp() {
  init({
    name: "runhost",
    remotes: [{ name: "app_02", entry: "http://localhost:3001/mf-manifest.json", alias: "a2" }],
    plugins: [runtimePlugin()],
  });

  loadRemote("a2/pi").then((module) => {
    console.log("results from pi in app02: ", (module as any).default());
  });
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
