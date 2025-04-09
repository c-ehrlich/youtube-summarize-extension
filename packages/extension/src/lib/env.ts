const hasUpdateUrl = "update_url" in chrome.runtime.getManifest();
// export const isProdMode = hasUpdateUrl;
export const isProdMode = true;

type Env = {
  backendUrl: string;
};

const devEnv = {
  backendUrl: "http://localhost:8787",
};

const prodEnv = {
  backendUrl: "https://yt-summarize-server.ehrlich-christopher.workers.dev",
};

export const env: Env = isProdMode ? prodEnv : devEnv;
