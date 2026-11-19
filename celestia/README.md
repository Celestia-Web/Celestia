# CELESTIA

A black-and-white pixel space game. Plain HTML/CSS/JS, no build step.

## Run it
- Locally: open `index.html` (or run `python3 -m http.server`).
- GitHub Pages: push this folder to a repo, then Settings > Pages > Deploy from branch > `main` / root.

## Notes
- Works at any tab size (the game scales to fit). It pauses if the tab is hidden.
- Font: Press Start 2P (loaded from Google Fonts).
- Mining speed = miner rate / toughness = 0.5 / 0.3 = 1.667 per second. Change it in `js/data.js` (`TUNING`).
- Art in `assets/`:
  - `farport.png` and `korr.png` are the arrival images. Override with `arrival-farport.png` / `arrival-korr.png`.
  - `ship.gif` is the warp/travel animation. Override with `travel-warp.gif`.
  - Optional `travel-remaining.png` is the picture shown during the 5 second countdown.
