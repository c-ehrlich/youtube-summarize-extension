import { useState } from "react";
import { ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "../ui/primitives/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/primitives/card";
import { Checkbox } from "../ui/primitives/checkbox";
import { Alert, AlertDescription, AlertTitle } from "../ui/primitives/alert";

export function InitAppForm() {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <main className="max-w-4xl w-full space-y-8">
        <header className="text-center space-y-4">
          <div className="flex justify-center">
            <p>todo: logo</p>
            {/* <Image
              src="/placeholder.svg?height=80&width=80"
              alt="YouTube Summarizer Logo"
              width={80}
              height={80}
              className="rounded-full"
            /> */}
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            YouTube Summarizer
          </h1>
          <p className="text-xl text-gray-600">
            Get quick summaries of YouTube videos with AI-powered technology
          </p>
        </header>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-2xl">Sign in with Google</CardTitle>
            <CardDescription>Recommended for most users</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Unlimited summaries</li>
              <li>Sync across devices</li>
              <li>No API key required</li>
              <li>Seamless integration with YouTube</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant="default"
              color="red"
              size="lg"
              className="w-full text-lg"
            >
              Sign in with Google
            </Button>
          </CardFooter>
        </Card>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="showAdvanced"
            checked={showAdvanced}
            onCheckedChange={(checked) => setShowAdvanced(!!checked)}
            className="bg-white"
          />
          <label
            htmlFor="showAdvanced"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Show advanced options
          </label>
        </div>

        {showAdvanced && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Advanced Mode</CardTitle>
              <CardDescription>For power users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Use your own OpenAI API key
              </p>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Using your own OpenAI API key may lead to unexpected costs.
                  Please monitor your usage carefully.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="w-full">
                Use Advanced Mode
              </Button>
            </CardFooter>
          </Card>
        )}

        <footer className="text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} YouTube Summarizer</p>
        </footer>
      </main>
    </div>
  );
}
