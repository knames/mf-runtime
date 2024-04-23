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
    handlePreloadModule(args) {
      args.remote.entry = 'http://localhost:3001/mf-manifest.json';
      args.remoteSnapshot.publicPath = 'http://localhost:3001/';
      return args;
    },
    async afterResolve(args: AfterResolveOptions): Promise<AfterResolveOptions> {
      args.remoteInfo.entry = 'http://localhost:3001/remoteEntry.js';
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

  loadRemote("app_02/pi").then((module) => {
    console.log("results from pi in app02: ", (module as any).default());
  });
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
