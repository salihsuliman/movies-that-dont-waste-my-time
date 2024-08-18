"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faFile,
  faFilm,
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

const FilmList = (): JSX.Element => {
  const router = useRouter();
  const pageParam = new URLSearchParams(window.location.search).get("page");
  const [films, setFilms] = useState<Film[]>([]);
  const [page, setPage] = useState<string>(pageParam || "1");
  const [viewMode, setViewMode] = useState<"grid" | "slideshow">("grid");
  const [currentFilmIndex, setCurrentFilmIndex] = useState<number>(0);

  useEffect(() => {
    if (!pageParam) {
      router.push(`?page=${page}`);
    }
    const fetchFilms = async () => {
      try {
        const response = await fetch("http://localhost:4000/", {
          method: "POST",
          body: JSON.stringify({ page }),
          headers: {
            "Content-Type": "application/json",
          },
        });
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
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {films.map((film) => (
            <div
              key={film.id}
              className={twMerge(
                "relative overflow-hidden rounded-lg transform transition-transform duration-300 hover:scale-105 w-48 h-72",
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
              {film.rottenTomatoesRating !== "N/A" && (
                <p className="absolute top-0 right-0 m-0 p-2 bg-black bg-opacity-70 text-white text-center text-sm rounded-t-lg">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDaC4TIe3OY6gAxtDfJdm2d3dwjjnrV4jVtg&s"
                    alt="Rotten Tomatoes"
                    className="w-4 h-4 inline-block"
                  />
                  {film.rottenTomatoesRating}
                </p>
              )}
              {
                <p className="absolute top-0 left-0 m-0 p-2 bg-black bg-opacity-70 text-white text-center text-sm rounded-t-lg">
                  <FontAwesomeIcon icon={faFilm} />
                  {film.imdbRating}
                </p>
              }
              {
                <p className="absolute bottom-0 right-0 m-0 p-2 bg-black bg-opacity-70 text-white text-center text-sm rounded-b-lg">
                  <FontAwesomeIcon icon={faFile} />
                  {film.letterBoxRating}
                </p>
              }
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
          <button
            className="bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 rounded"
            onClick={() => handlePageChange((parseInt(page) + 1).toString())}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}{" "}
    </div>
  );
};

export default FilmList;
