export const isProdMode = "update_url" in chrome.runtime.getManifest();

type Env = {
  backendUrl: string;
};

const devEnv = {
  backendUrl: "http://localhost:8787",
};

const prodEnv = {
  backendUrl: "https://yt-summarize-server.TODO:.workers.dev",
};

export const env: Env = isProdMode ? prodEnv : devEnv;
