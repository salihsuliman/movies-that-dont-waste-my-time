# movies-that-dont-waste-my-time

An app that pulls in movies from TheMovieDB API, then compares reviews from IMDb, Letterboxd, and Rotten Tomatoes. This provides an average rating, so you are not misled by skewed reviews.

Video explaining app: https://www.youtube.com/watch?v=-6toJu5ioYE

## Installation

Make sure to clone the repository and install the necessary dependencies for both the client and server.

### Client

1. Navigate to the `./client` directory:
    ```bash
    cd ./client
    ```
2. Install the required packages:
    ```bash
    npm install
    ```
3. Run the development server:
    ```bash
    npm run dev
    ```

### Server

1. Navigate to the `./server` directory:
    ```bash
    cd ./server
    ```
2. Install the required packages:
    ```bash
    npm install
    ```
3. Start the server:
    ```bash
    npm start
    ```

## Environment Variables

Don't forget to add a `.env` file in the `./server` directory to define the following variables:

```env
TMDB_API="your_tmdb_api_key"
OMDB_API="your_omdb_api_key"
```

Have fun!
