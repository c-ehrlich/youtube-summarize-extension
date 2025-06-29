/** @jsxImportSource solid-js */
import { createSignal, Show } from "solid-js";
import { AlertTriangle } from "lucide-solid";
import styles from "./Config.module.css";
import { Button } from "../ui-solid/primitives/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui-solid/primitives/card";
import { Checkbox } from "../ui-solid/primitives/checkbox";
import { Alert, AlertDescription, AlertTitle } from "../ui-solid/primitives/alert";

export function InitAppFormSolid() {
  const [showAdvanced, setShowAdvanced] = createSignal(false);

  return (
    <div class={styles.container}>
      <main class={styles.main}>
        <header class={styles.header}>
          <div class={styles.logoContainer}>
            <p>todo: logo</p>
          </div>
          <h1 class={styles.title}>
            YouTube Summarizer
          </h1>
          <p class={styles.subtitle}>
            Get quick summaries of YouTube videos with AI-powered technology
          </p>
        </header>

        <Card class={styles.card}>
          <CardHeader>
            <CardTitle class={styles.cardTitle}>Sign in with Google</CardTitle>
            <CardDescription>Recommended for most users</CardDescription>
          </CardHeader>
          <CardContent>
            <ul class={styles.list}>
              <li>Unlimited summaries</li>
              <li>Sync across devices</li>
              <li>No API key required</li>
              <li>Seamless integration with YouTube</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant="default"
              size="lg"
              class={styles.button}
            >
              Sign in with Google
            </Button>
          </CardFooter>
        </Card>

        <div class={styles.checkboxContainer}>
          <Checkbox
            checked={showAdvanced()}
            onCheckedChange={(checked: boolean) => setShowAdvanced(checked)}
            class={styles.checkbox}
          />
          <label
            for="showAdvanced"
            class={styles.checkboxLabel}
          >
            Show advanced options
          </label>
        </div>

        <Show when={showAdvanced()}>
          <Card class={styles.card}>
            <CardHeader>
              <CardTitle>Advanced Mode</CardTitle>
              <CardDescription>For power users</CardDescription>
            </CardHeader>
            <CardContent class={styles.cardContent}>
              <p class={styles.description}>
                Use your own OpenAI API key
              </p>
              <Alert variant="destructive">
                <AlertTriangle class="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Using your own OpenAI API key may lead to unexpected costs.
                  Please monitor your usage carefully.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button variant="outline" class={styles.button}>
                Use Advanced Mode
              </Button>
            </CardFooter>
          </Card>
        </Show>

        <footer class={styles.footer}>
          <p>&copy; {new Date().getFullYear()} YouTube Summarizer</p>
        </footer>
      </main>
    </div>
  );
}
