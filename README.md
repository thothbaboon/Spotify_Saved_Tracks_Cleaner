# Spotify Saved Tracks Cleaner

## Introduction

We all end up with hundred (thousands?) of liked songs in our Spotify account.
Sometimes, you might want to clean things up and sort these songs into more specific playlists.

But doing that requires many clicks for each song..
As developers can spend more time building a tool to do a task than doing it manually, I built this little app

It goes through your Liked Songs (saved tracks), and with just one key press per track, you can choose to:

- Move it to a specific playlist
- Remove it from Liked Songs
- Keep it in Liked Songs

![App Screenshot](/assets/app_screenshot.png)

## Usage

That's a very simple app - Nothing fancy here:

- jQuery (because we don't need React for 2 buttons and 3 divs)
- Most Spotify API calls are done from the frontend
- An Express server for the authentication
- And that's it!

Steps to run the app:
- Rename `.env.example` to `.env`.
- Fill in `client_id` and `client_secret` with your values from [developer.spotify.com](https://developer.spotify.com/).
- Run `npm install`
- Run `npm start`
- Open `127.0.0.1:8000` in your browser

## Potential Improvements

### Avoid Duplicates in Playlist

Currently, there’s nothing preventing the same track from being added multiple times to a playlist.

### Revert Changes / Go Back

If I press the wrong key and move a track to the wrong playlist, there’s no way to undo the action.
The only solution is to refresh the app and start over, which is very annoying.

### Listen to the Song

If I don’t remember a song, I’d like the ability to listen to it before deciding what to do with it.

### Auto Sort

A smart feature that could guess the best playlist for a song based on my existing playlists.
