import express from "express";
import cors from "cors";
import { Worker } from "worker_threads";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Gets movies from the worker thread
// The worker thread fetches movies from the TMDB API
// and fetches ratings from the OMDB API and Letterboxd
// The worker thread is created in the /get-movies endpoint
// and sends the movies with ratings back to the client

app.post("/get-movies", (req, res) => {
  const page = req.body.page ? parseInt(req.body.page, 10) : 1;
  const genre = req.body.genre ? req.body.genre : "";

  // We do this because we can't use __dirname in ES modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const worker = new Worker(path.resolve(__dirname, "./worker.ts"), {
    workerData: { page, genre },
  });

  worker.on("message", (moviesWithRatings) => {
    res.send(moviesWithRatings);
  });

  worker.on("error", (error) => {
    console.error("Worker error:", error);
    res.status(500).send("Internal Server Error");
  });

  worker.on("exit", (code) => {
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`);
      res.status(500).send("Internal Server Error");
    }
  });
  // Send a message to the worker
  worker.postMessage({ page, genre });
  console.log("Message sent to worker");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
