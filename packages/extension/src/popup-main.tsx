import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClient, trpc } from "./trpc";

function Popup() {
  console.log("yo");
  const helloQuery = trpc.hello.useQuery({ name: "Chrome Extension" });

  if (helloQuery.isLoading) return <div>Loading…</div>;
  if (helloQuery.error) return <div>Error: {helloQuery.error.message}</div>;

  return <div>{helloQuery.data}</div>;
}

function App() {
  const queryClient = useState(() => new QueryClient());
  const trpcClient = useState(() => createClient());

  return <p> we are in react</p>;

  // return (
  //   <trpc.Provider client={trpcClient} queryClient={queryClient}>
  //     <QueryClientProvider client={queryClient}>
  //       <p>we are in react</p>
  //     </QueryClientProvider>
  //   </trpc.Provider>
  // );
}

const rootEl = document.getElementById("root")!;
createRoot(rootEl).render(<App />);
