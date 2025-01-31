import { Axiom } from "@axiomhq/js";

export const createAxiom = ({
  token,
  datasetName,
}: {
  token: string;
  datasetName: string;
}) => {
  const axiom = new Axiom({
    token: token,
  });

  return {
    ingest: (log: Record<string, any>) => axiom.ingest(datasetName, [log]),
    flush: () => axiom.flush(),
  };
};

export type AxiomProvider = ReturnType<typeof createAxiom>;
