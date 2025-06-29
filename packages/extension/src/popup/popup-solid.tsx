/** @jsxImportSource solid-js */
import { createSignal, onMount, Show } from "solid-js";
import { Button } from "../ui-solid/primitives/button";
import styles from "./Popup.module.css";

export function PopupSolid() {
  const [apiKey, setApiKey] = createSignal("");
  const [status, setStatus] = createSignal<{
    message: string;
    isError: boolean;
  } | null>(null);

  onMount(() => {
    // Load saved API key on mount
    console.log("Loading API key...");
    chrome.storage.local.get(["openaiApiKey"]).then((result) => {
      if (chrome.runtime.lastError) {
        showStatus(
          "Error loading API key: " + chrome.runtime.lastError.message,
          true
        );
        return;
      }

      if (result.openaiApiKey) {
        setApiKey(result.openaiApiKey);
        console.log("API key loaded successfully");
      } else {
        console.log("No API key found");
      }
    });
  });

  const showStatus = (message: string, isError = false) => {
    setStatus({ message, isError });
    console.log(`Status: ${message}`);
  };

  const handleSave = async () => {
    const trimmedApiKey = apiKey().trim();

    if (!trimmedApiKey) {
      showStatus("Please enter an API key", true);
      return;
    }

    if (!trimmedApiKey.startsWith("sk-")) {
      showStatus("Invalid API key format. Should start with 'sk-'", true);
      return;
    }

    console.log("Saving API key...");
    try {
      await chrome.storage.local.set({ openaiApiKey: trimmedApiKey });
      showStatus("API Key saved successfully!");
      console.log("API key saved successfully");
    } catch (error) {
      showStatus(`Error saving API key: ${error}`, true);
    }
  };

  const apiKeyStartsWithSk = () => apiKey().startsWith("sk-");
  const apiKeyIsReasonablyLong = () => apiKey().length > 40;
  const isMaybeValidApiKey = () => apiKeyStartsWithSk() && apiKeyIsReasonablyLong();

  return (
    <div class={styles.container}>
      <div class={styles.content}>
        <h1 class={styles.title}>Settings</h1>
        <div>
          <label for="apiKey" class={styles.label}>
            OpenAI API Key:
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey()}
            onInput={(e) => setApiKey(e.currentTarget.value)}
            placeholder="sk-..."
            class={styles.input}
          />
        </div>

        <Show when={apiKey().length > 0}>
          <Show when={!apiKeyStartsWithSk()}>
            <p class={styles.error}>
              Invalid API key format. Should start with 'sk-'.
            </p>
          </Show>
          <Show when={apiKeyStartsWithSk() && !apiKeyIsReasonablyLong()}>
            <p class={styles.error}>
              API key is too short. Please make sure you copied the entire
              key.
            </p>
          </Show>
        </Show>

        <Button
          disabled={!isMaybeValidApiKey()}
          onClick={handleSave}
          class={styles.button}
        >
          Save
        </Button>
        <Show when={status()}>
          {(currentStatus) => (
            <div
              class={`${styles.status} ${
                currentStatus().isError
                  ? styles.statusError
                  : styles.statusSuccess
              }`}
            >
              {currentStatus().message}
            </div>
          )}
        </Show>
      </div>
    </div>
  );
}
