"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";

interface Film {
  id: number;
  title: string;
  imageUrl: string;
  overview: string;
  releaseDate: string;
  rottenTomatoesRating: string;
  imdbRating: string;
  letterBoxRating: string;
}
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
  letterBoxRating: string;
}

const GenreFilter = [
  {
    id: 28,
    name: "Action",
  },
  {
    id: 12,
    name: "Adventure",
  },
  {
    id: 16,
    name: "Animation",
  },
  {
    id: 35,
    name: "Comedy",
  },
  {
    id: 80,
    name: "Crime",
  },
  {
    id: 99,
    name: "Documentary",
  },
  {
    id: 18,
    name: "Drama",
  },
  {
    id: 10751,
    name: "Family",
  },
  {
    id: 14,
    name: "Fantasy",
  },
  {
    id: 36,
    name: "History",
  },
  {
    id: 27,
    name: "Horror",
  },
  {
    id: 9648,
    name: "Mystery",
  },
  {
    id: 10749,
    name: "Romance",
  },
  {
    id: 878,
    name: "Science Fiction",
  },
  {
    id: 53,
    name: "Thriller",
  },
  {
    id: 10752,
    name: "War",
  },
  {
    id: 37,
    name: "Western",
  },
];

const FilmList = (): JSX.Element => {
  const router = useRouter();
  const pageParam = new URLSearchParams(window.location.search).get("page");
  const [films, setFilms] = useState<Film[]>([]);
  const [page, setPage] = useState<string>(pageParam || "1");
  const [viewMode, setViewMode] = useState<"grid" | "slideshow">("grid");
  const [currentFilmIndex, setCurrentFilmIndex] = useState<number>(0);
  const [fullLoading, setFullLoading] = useState<boolean>(false);
  const [genreArray, setGenreArray] = useState<
    {
      id: number;
      name: string;
    }[]
  >([]);

  const fetchFilms = async () => {
    setFullLoading(true);
    try {
      const genreArrayToString = genreArray.map((genre) => genre.id).join(",");
      const response = await fetch("http://localhost:4000/", {
        method: "POST",
        body: JSON.stringify({ page, genre: genreArrayToString }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setFullLoading(false);

      const data = (await response.json()) as Movie[];
      const formattedFilms = data.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        imageUrl: `https://image.tmdb.org/t/p/original${movie.poster_path}`,
        overview: movie.overview,
        releaseDate: movie.release_date,
        rottenTomatoesRating: movie.rottenTomatoesRating,
        imdbRating: movie.imdbRating,
        letterBoxRating: movie.letterBoxRating,
      }));

      formattedFilms.sort((a, b) => {
        // order by highest average rating from rotten tomatoes, imdb, and letterboxd
        const aRating =
          (a.rottenTomatoesRating ? parseFloat(a.rottenTomatoesRating) : 0) +
          (a.imdbRating ? parseFloat(a.imdbRating) : 0) +
          (a.letterBoxRating ? parseFloat(a.letterBoxRating) : 0);
        const bRating =
          (b.rottenTomatoesRating ? parseFloat(b.rottenTomatoesRating) : 0) +
          (b.imdbRating ? parseFloat(b.imdbRating) : 0) +
          (b.letterBoxRating ? parseFloat(b.letterBoxRating) : 0);
        return bRating - aRating;
      });
      setFilms(formattedFilms);
    } catch (error) {
      console.error("Error fetching films:", error);
    }
  };

  useEffect(() => {
    if (!pageParam) {
      router.push(`?page=${page}`);
    }

    fetchFilms();
  }, [page, pageParam, router]);

  const handlePageChange = (newPage: string) => {
    setPage(newPage);
    router.push(`?page=${newPage}`);
  };

  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === "grid" ? "slideshow" : "grid"));
  };

  const handleNextFilm = () => {
    setCurrentFilmIndex((prevIndex) => (prevIndex + 1) % films.length);
  };

  const handlePreviousFilm = () => {
    setCurrentFilmIndex(
      (prevIndex) => (prevIndex - 1 + films.length) % films.length
    );
  };

  console.log(films[currentFilmIndex]);

  if (fullLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full py-2">
        <button
          className={
            "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
          }
          onClick={() => {}}
        >
          Toggle View Mode
        </button>

        <div className="flex flex-wrap w-1/2">
          {GenreFilter.map((genre) => (
            <button
              key={genre.id}
              className={twMerge(
                "bg-white text-black font-bold py-2 px-4 rounded m-2"
              )}
              onClick={() => {}}
            >
              {genre.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {Array.from({ length: 24 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-gray-200 rounded-lg w-48 h-72"
            />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full py-2">
      <button
        className={
          "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        }
        onClick={toggleViewMode}
      >
        Toggle View Mode
      </button>
      {viewMode === "grid" && (
        <div className="flex flex-wrap w-1/2">
          {GenreFilter.map((genre) => (
            <button
              key={genre.id}
              className={twMerge(
                "bg-white text-black font-bold py-2 px-4 rounded m-2",
                genreArray.some((prevGenre) => prevGenre.id === genre.id)
                  ? "bg-green-300"
                  : "",
                genreArray.some((prevGenre) => prevGenre.id === genre.id)
                  ? "hover:bg-green-300"
                  : "hover:bg-gray-200"
              )}
              onClick={() => {
                setGenreArray((prevGenres) => {
                  if (
                    prevGenres.some((prevGenre) => prevGenre.id === genre.id)
                  ) {
                    return prevGenres.filter(
                      (prevGenre) => prevGenre.id !== genre.id
                    );
                  } else {
                    return [...prevGenres, genre];
                  }
                });
              }}
            >
              {genre.name}
            </button>
          ))}
          {genreArray.length > 0 && (
            <>
              <button
                className="bg-red-600 hover:bg-red-200 text-white font-bold py-2 px-4 rounded m-2"
                onClick={() => setGenreArray([])}
              >
                Clear Filters
              </button>
              <button
                className="bg-green-600 hover:bg-green-200 text-white font-bold py-2 px-4 rounded m-2"
                onClick={() => fetchFilms()}
              >
                Filter
              </button>
            </>
          )}
        </div>
      )}{" "}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {films.map((film) => (
            <div
              key={film.id}
              className={twMerge(
                "relative overflow-visible rounded-lg mb-6 transform transition-transform duration-300 hover:scale-105 w-48 h-72",
                currentFilmIndex === films.indexOf(film)
                  ? "border-2 border-green-300"
                  : ""
              )}
              onClick={() => {
                setViewMode("slideshow");
                setCurrentFilmIndex(films.indexOf(film));
              }}
            >
              <Image
                loading="lazy"
                src={film.imageUrl}
                alt={film.title}
                width={192}
                height={288}
                className="w-full h-full object-cover rounded-lg"
              />
              <h3 className="absolute bottom-0 left-0 right-0 m-0 p-2 bg-black bg-opacity-70 text-white text-center text-sm rounded-b-lg">
                {film.title}
              </h3>
              <div className="flex flex-row w-full items-center justify-center">
                <p className="flex flex-row items-center justify-center p-2  text-white text-center text-sm rounded-t-lg">
                  <img
                    src="/assets/tomato.png"
                    alt="Rotten Tomatoes"
                    className="w-4 h-4 inline-block mr-1"
                  />
                  {film.rottenTomatoesRating}
                </p>

                <p className="flex flex-row items-center justify-center p-2  text-white text-center text-sm rounded-t-lg">
                  <img
                    src="/assets/imdb.png"
                    alt="Rotten Tomatoes"
                    className="w-4 h-4 inline-block mr-1"
                  />
                  {film.imdbRating}
                </p>

                <p className="flex flex-row items-center justify-center p-2  text-white text-center text-sm rounded-b-lg">
                  <img
                    src="/assets/letterboxd.png"
                    alt="Rotten Tomatoes"
                    className="w-4 h-4 inline-block mr-1"
                  />
                  {film.letterBoxRating}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {films.length > 0 && (
            <div className="flex flex-row justify-evenly">
              <Image
                src={films[currentFilmIndex].imageUrl}
                alt={films[currentFilmIndex].title}
                width={500}
                height={750}
                className="w-[400px] h-auto object-cover rounded-lg"
              />
              <div className="w-1/3">
                <h3 className="text-2xl font-bold mt-4">
                  {films[currentFilmIndex].title}
                </h3>
                <h3 className="text-2xl font-bold mt-4">
                  Release date: {films[currentFilmIndex].releaseDate}
                </h3>
                <p className="mt-2">{films[currentFilmIndex].overview}</p>
              </div>
            </div>
          )}
          <div className="flex justify-center items-center space-x-4 mt-4">
            <button
              className="bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 rounded"
              onClick={handlePreviousFilm}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              className="bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 rounded"
              onClick={handleNextFilm}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      )}
      {viewMode === "grid" && (
        <div className="flex justify-center items-center space-x-4 mt-4">
          {(!page || page !== "1") && (
            <button
              className="bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 rounded"
              onClick={() => handlePageChange((parseInt(page) - 1).toString())}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          )}
          <div>
            <p className="text-lg font-bold">{page}</p>
          </div>
          <button
            className="bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 rounded"
            onClick={() => handlePageChange((parseInt(page) + 1).toString())}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FilmList;
