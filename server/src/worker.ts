import { parentPort, workerData } from "worker_threads";
import fetch from "node-fetch";
import pLimit from "p-limit";

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
];

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

// Get a random user agent for web scraping
const getRandomUserAgent = () => {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

// Used to fetch a URL with a timeout just incase the request takes too long
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
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.error("Fetch request aborted:", url);
      } else {
        console.error("Fetch error:", error.message);
      }
    } else {
      console.error("Unknown error:", error);
    }

    throw error;
  }
};

// Fetch JSON data from a URL and return "N/A" if there is an error
// Makes it easier to pluck data from an API without worrying about errors
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
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Error fetching JSON: Request timed out", url);
    } else {
      console.error("Error fetching JSON:", error);
    }
    return "N/A";
  }
};

// Get the Letterboxd rating for a movie
// Grabs html data from the Letterboxd page for a movie and scrapes the rating from the meta tag
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

// Main function to fetch movies from the TMDB API
// Fetches movies from a specific genre and page

// When we have the movies we want to fetch ratings for each movie by looping through each movie
// We limit the number of concurrent requests to 10 to prevent the server from being overloaded (I have a bad laptop lmfaoo)
// For each movie we fetch the ratings from the OMDB API and Letterboxd
// We fetch the movie data from the OMDB API using the movie title and we get the IMDB and Rotten Tomatoes rating returned.
// We fetch the Letterboxd rating by using the getLetterboxdRating function
// We return the movie with the ratings and send it back to the client
const fetchMoviesWithRatings = async (page: number, genre: string) => {
  // Fetches movies from the TMDB API, we sort by vote count and only get movies from 2010 onwards
  const response = await fetchWithTimeout(
    `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API}&language=en-US&page=${page}&with_original_language=en&sort_by=vote_count.desc&with_genres=${genre}&primary_release_date.gte=2010-10-12`
  );

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.statusText}`);
  }

  const movies = (await response.json()) as MovieResponse;

  const limit = pLimit(10);
  const moviesWithRatings = await Promise.all(
    movies.results.map((movie) =>
      limit(async () => {
        try {
          const [imdbResponse, letterBoxRating] = await Promise.all([
            fetchJson(
              `https://www.omdbapi.com/?t=${movie.title}&apikey=${process.env.OMDB_API}`
            ) as any,
            getLetterboxdRating(movie.id),
          ]);

          const imdbRating = imdbResponse.imdbRating || "N/A";
          let omdbRottenTomato = { Value: "N/A" };

          if (imdbResponse.Ratings) {
            omdbRottenTomato = imdbResponse.Ratings.find(
              (rating: any) => rating.Source === "Rotten Tomatoes"
            ) || { Value: "N/A" };
          }

          return {
            ...movie,
            rottenTomatoesRating: omdbRottenTomato.Value,
            imdbRating,
            letterBoxRating,
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

  return moviesWithRatings;
};

// Listens for a message from the parent thread aka index.ts
parentPort?.on("message", async (data) => {
  try {
    const { page, genre } = data;
    const moviesWithRatings = await fetchMoviesWithRatings(page, genre);
    parentPort?.postMessage(moviesWithRatings);
  } catch (error) {
    if (error instanceof Error) {
      parentPort?.postMessage({ error: error.message });
    } else {
      parentPort?.postMessage({ error: "An unknown error occurred" });
    }
  }
});
