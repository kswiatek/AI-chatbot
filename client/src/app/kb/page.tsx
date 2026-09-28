"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { API_URL } from "@/lib/config";
import { FormEvent, useState } from "react";

type Source = {
  source: string;
  chunkId: number;
};

type AskResponse = {
  answer: string;
  sources: Source[];
  confidence: number;
};

type IngestResult = {
  ok: boolean;
  chunkCount: number;
  docCount: number;
  source: string;
};

export default function LightRagKB() {
  const [ingestText, setIngestText] = useState("");
  const [ingestSource, setIngestSource] = useState("");
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestMessage, setIngestMessage] = useState<string | null>(null);

  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState(2);
  const [askLoading, setAskLoading] = useState(false);
  const [time, setTime] = useState<number | null>(null);

  const [answerData, setAnswerData] = useState<AskResponse | null>(null);
  const [showSources, setShowSources] = useState(true);

  const handleIngest = async (event: FormEvent) => {
    event.preventDefault();
    setIngestLoading(true);
    setIngestMessage(null);

    try {
      const res = await fetch(`${API_URL}/kb/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: ingestText,
          source: ingestSource || undefined,
        }),
      });

      const json: IngestResult | { error: string } = await res.json();
      if (!res.ok) {
        throw new Error("Ingest failed");
      }
      const result = json as IngestResult;
      setIngestMessage(`Ingested ${result.chunkCount} from ${result.source}`);
    } catch (er) {
      console.log("🚀 ~ handleIngest ~ er:", er);
    } finally {
      setIngestLoading(false);
    }
  };

  const handleAskQuerySubmit = async (event: FormEvent) => {
    event.preventDefault();
    setAskLoading(true);
    setAnswerData(null);
    setTime(null);

    const time = performance.now();

    try {
      const res = await fetch(`${API_URL}/kb/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: question,
          k: topK,
        }),
      });

      const json: AskResponse | { error: string } = await res.json();
      if (!res.ok) {
        throw new Error("Ask failed");
      }
      setAnswerData(json as AskResponse);
    } catch (er) {
      console.log("🚀 ~ handleAskQuerySubmit ~ er:", er);
    } finally {
      setTime(Math.round(performance.now() - time));
      setAskLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Knowledge Base (KB)
        </h1>
        <p className="text-sm text-muted-foreground">
          Light RAG Demo. Add your own docs, then ask questions. The model will
          answer from what you added.
        </p>
      </header>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Add to KB</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleIngest}>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Source Label
                </label>
                <Input
                  placeholder="Add your source here..."
                  className="text-sm"
                  value={ingestSource}
                  onChange={(e) => setIngestSource(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Text / Markdown
                </label>
                <Textarea
                  className="min-h-[200px] font-mono text-xs leading-relaxed resize-y"
                  placeholder="Paste docs, policy text or any onboarding notes..."
                  value={ingestText}
                  onChange={(e) => setIngestText(e.target.value)}
                />
              </div>
              <div className="flex item-center gap-2">
                <Button type="button" variant="secondary">
                  Reset
                </Button>
                <Button type="submit">
                  {ingestLoading ? "Ingesting..." : "Ingest to KB"}
                </Button>
              </div>
            </form>
            <div className="text-xs">
              {ingestMessage ? (
                <div className="text-green-500">{ingestMessage}</div>
              ) : null}
            </div>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Your Query
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <form
              className="flex flex-col gap-4"
              onSubmit={handleAskQuerySubmit}
            >
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Your Query
                </label>
                <Input
                  className="text-sm"
                  placeholder="Add your question here..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Top K Answers
                </label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={topK}
                  className="text-sm"
                  onChange={(e) => setTopK(parseInt(e.target.value || "2", 5))}
                />
              </div>
              <div className="flex item-center gap-2">
                <Button type="submit">
                  {askLoading ? "Asking..." : "Ask KB"}
                </Button>
              </div>
            </form>
            {answerData && (
              <div className="flex flex-col gap-4 pt-5">
                <div className="rounded-md border g-muted/30 p-3 text-sm leading-relaxed whitespace-pre-wrap">
                  {answerData.answer}
                </div>
                <div className="text-[14px] text-green-600">Time: {time}ms</div>
                {showSources && (
                  <div className="flex flex-col gap-2">
                    <span>Sources ({answerData.sources.length})</span>
                    <Separator />
                    <ul className="space-y-3">
                      {answerData.sources.map((source, i) => (
                        <li key={i} className="text-xs">
                          <div className="font-medium text-foreground">
                            {source.source}
                            <span>#{source.chunkId}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
