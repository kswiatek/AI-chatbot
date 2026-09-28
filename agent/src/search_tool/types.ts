export type candidate = {
  answer: string;
  sources: string[]; // empty in direct mode, not browsing
  mode: "web" | "direct";
};
