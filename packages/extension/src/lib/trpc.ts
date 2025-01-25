import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import { type AppRouter } from "@yt-summarize/trpc";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      // TODO: don't hardcode this
      url: "http://localhost:8787/trpc",
      // You can pass any HTTP headers you wish here
      // async headers() {
      //   return {
      //     authorization: getAuthCookie(),
      //   };
      // },
    }),
  ],
});
