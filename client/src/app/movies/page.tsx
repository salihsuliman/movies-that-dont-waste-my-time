"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter, useSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { Film, GenreFilter, Movie } from "@/utils/constants";
import FilmDetails from "./FilmDetails";

const FilmList = (): JSX.Element => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageParam = searchParams.get("page");

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

  // Fetches films from the server and sets the state
  const fetchFilms = async () => {
    setFullLoading(true);
    try {
      const genreArrayToString = genreArray.map((genre) => genre.id).join(",");
      const response = await fetch("http://localhost:4000/get-movies", {
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

      setFilms(formattedFilms);
    } catch (error) {
      console.error("Error fetching films:", error);
    }
  };

  // Handles loading the page when no page params are present
  useEffect(() => {
    if (!pageParam) {
      router.push(`?page=${page}`);
    }

    fetchFilms();
  }, [page, router]);

  // Handles loading the page when the page params change
  const handlePageChange = (newPage: string) => {
    setPage(newPage);
    router.push(`?page=${newPage}`);
  };

  // Toggles the view mode between grid and slideshow
  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === "grid" ? "slideshow" : "grid"));
  };

  // Handles the next film in the slideshow
  const handleNextFilm = () => {
    setCurrentFilmIndex((prevIndex) => (prevIndex + 1) % films.length);
  };

  // Handles the previous film in the slideshow
  const handlePreviousFilm = () => {
    setCurrentFilmIndex(
      (prevIndex) => (prevIndex - 1 + films.length) % films.length
    );
  };

  // If the page is loading, show a loading state
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
      {/* Shows different genres user can select. Only shown in grid mode */}

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
      )}
      {/* Logic condition that only shows grid view when viewMode is set to grid else we know its slideshow mode */}

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
          {films.length > 0 && <FilmDetails film={films[currentFilmIndex]} />}
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
      {/* Only show page changing when in grid mode */}
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
