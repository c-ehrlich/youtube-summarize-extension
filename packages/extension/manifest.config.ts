import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest(() => ({
  name: "NoMoreBait",
  description: "Don't clickbait me bruh",
  version: "0.0.1",
  manifest_version: 3,
  permissions: [],
  // Example popup
  action: {
    default_popup: "src/popup.html",
  },
}));
