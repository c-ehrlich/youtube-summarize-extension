/** @jsxImportSource solid-js */
import { createSignal, Show } from "solid-js";
import { AlertTriangle } from "lucide-solid";
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
    <div class="min-h-screen flex flex-col items-center justify-center p-4">
      <main class="max-w-4xl w-full space-y-8">
        <header class="text-center space-y-4">
          <div class="flex justify-center">
            <p>todo: logo</p>
          </div>
          <h1 class="text-4xl font-bold text-gray-900">
            YouTube Summarizer
          </h1>
          <p class="text-xl text-gray-600">
            Get quick summaries of YouTube videos with AI-powered technology
          </p>
        </header>

        <Card class="bg-white">
          <CardHeader>
            <CardTitle class="text-2xl">Sign in with Google</CardTitle>
            <CardDescription>Recommended for most users</CardDescription>
          </CardHeader>
          <CardContent>
            <ul class="list-disc list-inside space-y-2 text-gray-600">
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
              class="w-full text-lg"
            >
              Sign in with Google
            </Button>
          </CardFooter>
        </Card>

        <div class="flex items-center space-x-2">
          <Checkbox
            checked={showAdvanced()}
            onCheckedChange={(checked: boolean) => setShowAdvanced(checked)}
            class="bg-white"
          />
          <label
            for="showAdvanced"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Show advanced options
          </label>
        </div>

        <Show when={showAdvanced()}>
          <Card class="bg-white">
            <CardHeader>
              <CardTitle>Advanced Mode</CardTitle>
              <CardDescription>For power users</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <p class="text-sm text-gray-500">
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
              <Button variant="outline" class="w-full">
                Use Advanced Mode
              </Button>
            </CardFooter>
          </Card>
        </Show>

        <footer class="text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} YouTube Summarizer</p>
        </footer>
      </main>
    </div>
  );
}
