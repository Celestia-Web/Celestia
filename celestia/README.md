# CELESTIA

A black-and-white pixel space game. Plain HTML/CSS/JS, no build step.

## Run it
- Locally: open `index.html` (or run `python3 -m http.server`).
- GitHub Pages: push this folder to a repo, then Settings > Pages > Deploy from branch > `main` / root.

## Repo layout
Put these at the repo root: `index.html`, `style.css`, `assets.js`, `data.js`, `game.js`. Images are embedded in `assets.js`, so no assets folder is needed.

## Notes
- Works at any tab size (the game scales to fit). It pauses if the tab is hidden.
- Font: Press Start 2P (loaded from Google Fonts).
- Mining speed = miner rate / toughness = 0.5 / 0.3 = 1.667 per second. Change it in `data.js` (`TUNING`).
- Art: `assets.js` holds `ship` (travel animation + naming screen), `farport` and `korr` (arrival scenes). Replace any value with your own image URL or data URI.
