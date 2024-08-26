import { useState } from "react";
import Image from "next/image";

type FilmProp = {
  film: {
    imageUrl: string;
    title: string;
    releaseDate: string;
    overview: string;
  };
};

const FilmDetails = ({ film }: FilmProp): JSX.Element => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  return (
    <div className="flex flex-row justify-evenly">
      <div className="relative w-[400px] h-auto">
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            Loading...
          </div>
        )}
        <img
          src={film.imageUrl}
          alt={film.title}
          width={500}
          height={750}
          className={`w-[400px] h-auto object-cover rounded-lg ${
            isImageLoading ? "hidden" : "block"
          }`}
          onLoad={() => {
            setIsImageLoading(false);
          }}
        />
      </div>
      <div className="w-1/3">
        <h3 className="text-2xl font-bold mt-4">{film.title}</h3>
        <h3 className="text-2xl font-bold mt-4">
          Release date: {film.releaseDate}
        </h3>
        <p className="mt-2">{film.overview}</p>
      </div>
    </div>
  );
};

export default FilmDetails;
