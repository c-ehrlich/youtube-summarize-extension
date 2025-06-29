import { useState, useEffect } from "react";
import "../index.css";
import { Button } from "../ui/primitives/button";

export function Popup() {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);

  useEffect(() => {
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
  }, []);

  const showStatus = (message: string, isError = false) => {
    setStatus({ message, isError });
    console.log(`Status: ${message}`);
  };

  const handleSave = async () => {
    const trimmedApiKey = apiKey.trim();

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

  const apiKeyStartsWithSk = apiKey.startsWith("sk-");
  const apiKeyIsReasonablyLong = apiKey.length > 40;

  const isMaybeValidApiKey = apiKeyStartsWithSk && apiKeyIsReasonablyLong;

  return (
    <div className="w-[300px] p-4 font-sans">
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-bold">Settings</h1>
        <div>
          <label htmlFor="apiKey" className="block mb-1">
            OpenAI API Key:
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full p-2 border rounded"
          />
        </div>

        {apiKey.length > 0 ? (
          <>
            {!apiKeyStartsWithSk ? (
              <p className="text-red-500">
                Invalid API key format. Should start with 'sk-'.
              </p>
            ) : !apiKeyIsReasonablyLong ? (
              <p className="text-red-500">
                API key is too short. Please make sure you copied the entire
                key.
              </p>
            ) : null}
          </>
        ) : null}

        <Button
          disabled={!isMaybeValidApiKey}
          onClick={handleSave}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Save
        </Button>
        {status && (
          <div
            className={`p-2 rounded ${
              status.isError
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
