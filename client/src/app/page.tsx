import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen text-center justify-evenly items-center text-xl">
      <p>
        Tired of looking for films to watch? <br />
        Keep finding films with <strong>"good reviews"</strong> and
        <strong>"good ratings"</strong> but they're trash?
        <br /> Well look no more!
      </p>
      <Link href={{ pathname: "/movies", query: { page: 1 } }}>
        <button className="bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 rounded mt-4">
          View Movies
        </button>
      </Link>
    </main>
  );
}
