import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import { type AppRouter } from "@yt-summarize/server/src/trpc/index";
import { env } from "./env";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${env.backendUrl}/trpc`,
      // You can pass any HTTP headers you wish here
      // async headers() {
      //   return {
      //     authorization: getAuthCookie(),
      //   };
      // },
    }),
  ],
});
