export interface KBChunk {
  /** logical grouping */
  namespace: string;
  /** e.g. filename.pdf */
  source: string;
  chunkId: number;
  text: string;
  embedding: number[];
}
