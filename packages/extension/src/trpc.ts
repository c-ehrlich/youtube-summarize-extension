import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@yt-summarize/trpc";
import { httpBatchLink } from "@trpc/client";

export const trpc = createTRPCReact<AppRouter>();

export function createClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: "http://localhost:3000/trpc",
        // You can pass any HTTP headers you wish here
        // async headers() {
        //   return {
        //     authorization: getAuthCookie(),
        //   };
        // },
      }),
    ],
  });
}
