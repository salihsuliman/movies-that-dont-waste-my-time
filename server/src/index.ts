import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import pLimit from "p-limit";

interface Movie {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  rottenTomatoesRating: string;
  imdbRating: string;
  totalRating: number;
}

interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

const app = express();
const port = 4000;
const TMDB_API = "0b442244c2fd66b85dc89ff05dea8d7f";
const OMDB_API = "8a062458";

app.use(cors());
app.use(express.json());

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
];

const getRandomUserAgent = () => {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

const fetchWithTimeout = async (url: string, timeout: number = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": getRandomUserAgent(),
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const getRottenTomatoesRating = async (title: string) => {
  let formattedTitle = title.trim().replace(/[\W_]+/g, "_");
  if (title.includes("&")) formattedTitle = title.replace("&", "and");

  try {
    const response = await fetchWithTimeout(
      `https://www.rottentomatoes.com/m/${formattedTitle}`,
      7000
    );

    const html = await response.text();

    const jsonMatch = html.match(
      /<script id="media-scorecard-json"[^>]*>(.*?)<\/script>/
    );
    if (jsonMatch && jsonMatch[1]) {
      const jsonData = JSON.parse(jsonMatch[1]);
      return jsonData.audienceScore?.scorePercent || "N/A";
    } else {
      return "N/A";
    }
  } catch (error) {
    console.error("Error fetching Rotten Tomatoes rating:", error);
    return "N/A";
  }
};

const fetchJson = async (url: string) => {
  try {
    const response = await fetchWithTimeout(url);
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    } else {
      return "N/A";
    }
  } catch (error) {
    console.error("Error fetching JSON:", error);
    return "N/A";
  }
};

const getLetterboxdRating = async (id: number) => {
  try {
    const response = await fetchWithTimeout(
      `https://letterboxd.com/tmdb/${id}/`
    );
    const html = await response.text();

    const ratingMatch = html.match(
      /<meta name="twitter:data2" content="([\d.]+) out of 5" \/>/
    );
    if (ratingMatch && ratingMatch[1]) {
      return ratingMatch[1];
    } else {
      return "N/A";
    }
  } catch (error) {
    console.error("Error fetching Letterboxd rating:", error);
    return "N/A";
  }
};

app.post("/", async (req, res) => {
  try {
    const page = req.body.page ? parseInt(req.body.page, 10) : 1;

    const response = await fetchWithTimeout(
      `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API}&language=en-US&page=${page}&primary_release_date.gte=2020-01-01`
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .send(`TMDB API Error: ${response.statusText}`);
    }

    const movies = (await response.json()) as MovieResponse;

    const limit = pLimit(10);
    const moviesWithRatings = await Promise.all(
      movies.results.map((movie) =>
        limit(async () => {
          try {
            // 	<meta name="twitter:label2" content="Average rating" /><meta name="twitter:data2" content="4.20 out of 5" />
            const [rottenTomatoesRating, imdbResponse, letterBoxRating] =
              await Promise.all([
                getRottenTomatoesRating(movie.title),
                fetchJson(
                  `https://www.omdbapi.com/?t=${encodeURIComponent(
                    movie.title
                  )}&apikey=${OMDB_API}`
                ) as any,
                getLetterboxdRating(movie.id),
              ]);

            const imdbRating = imdbResponse.imdbRating || "N/A";

            return {
              ...movie,
              rottenTomatoesRating,
              imdbRating,
              letterBoxRating,
              totalRating:
                (movie.vote_average +
                  parseFloat(imdbRating) +
                  parseFloat(rottenTomatoesRating) +
                  parseFloat(letterBoxRating)) /
                4,
            };
          } catch (error) {
            console.error("Error fetching ratings:", error);
            return {
              ...movie,
              rottenTomatoesRating: "N/A",
              imdbRating: "N/A",
              letterBoxRating: "N/A",
            };
          }
        })
      )
    );

    const sortedMoviesWithRatings = moviesWithRatings.sort(
      (a, b) => b.totalRating - a.totalRating
    );

    res.send(sortedMoviesWithRatings);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
