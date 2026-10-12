import { Router } from "express";
import multer from "multer";
import { loadFileAsDocuments, SupportedMime } from "../kb/01_loaders";
import { splitDocuments } from "../kb/02_splitter";
import { ingestDocuments } from "../kb/04_ingest";

export const kbRouter = Router();

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1021 * 1024, // 10MB
  },
});

kbRouter.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const namespace = "default";
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "No file uploaded",
      });
    }

    const { path, mimetype, originalname } = req.file; // originalname is e.g. 'name.pdf'

    const rawDocs = await loadFileAsDocuments({
      filePath: path,
      mimeType: mimetype as SupportedMime,
      originalName: originalname,
    });

    if (!rawDocs.length) {
      return res.status(400).json({
        ok: false,
        message: "Unsupported or empty file",
      });
    }

    const chunks = await splitDocuments(rawDocs);
    if (!chunks.length) {
      return res.status(400).json({
        ok: false,
        message: "File loaded but produced no usable chunks after splitting",
      });
    }

    const summary = await ingestDocuments(namespace, chunks);

    return res.status(200).json({
      ok: summary.ok,
      namespace: summary.namespace,
      totalChunks: summary.totalChunks,
      sources: summary.sources,
    });
  } catch (er) {
    console.log("Error: " + er);
    res.status(500).json({
      message: "Something went wrong while uploading the file",
      ok: false,
    });
  }
});
