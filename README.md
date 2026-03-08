# Idle Summoner TD (Three.js)

A standalone Three.js tower defense prototype inspired by Summoner's Greed-style idle gameplay.

## Run

From this folder, start a local web server:

```bash
python3 -m http.server 5173
```

Then open:

- http://localhost:5173

## Core Loop

- Passive gold income over time.
- Summon random towers and place them on green tiles.
- Defend the chest from pathing enemies.
- Upgrade or sell towers for economy control.
- Cast Fireball (targeted) and Freeze (global slow).
- Waves auto-start on a timer, or start manually.

## Controls

- `Summon Tower`: Draw a random tower card, then click a build tile.
- Click an existing tower: Select it.
- `Upgrade`: Improve selected tower stats.
- `Sell`: Refund 65% of invested cost.
- `Fireball`: Arm spell, then click board to detonate.
- `Freeze`: Slow all enemies for a short duration.
- `Speed`: Toggle 1x / 2x simulation speed.

## Notes

- Game state autosaves to browser `localStorage` every few seconds.
- If chest HP reaches 0, restart from the in-game overlay.
