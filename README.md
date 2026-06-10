# 4Kingsmen

A local browser prototype of the 4Kingsmen ruleset using the `.glb` unit assets in `3D/` and the unit portraits in `units/`.

## Run

Serve the folder from a local web server, then open the printed URL.

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then visit:

```text
http://127.0.0.1:4173
```

The game imports Three.js from a CDN, so the browser needs internet access the first time it loads.

## Images

Optional custom art can live in `images/`.

- Favicon names detected automatically: `favicon.ico`, `favicon.png`, `favicon.svg`, `favicon.webp`, `icon.ico`, or `icon.png`.
- Main menu theme names detected automatically: `main-menu-theme.png`, `main-menu-theme.jpg`, `main menu theme.png`, `menu-theme.png`, `main-menu.png`, `menu.png`, `background.png`, or `theme.png` with common web image extensions.

## Implemented

- Civ-style navigation flow: Main Menu, Single Player, Create Game, Advanced Setup, Play Now, and Start Game.
- Match presets for official four-player, duel, triad, and full-chaos setups.
- Advanced ability toggles for special rules, including bombers, Seeker reveal, Warden aura, Phantom mine theft, teleporting, sentinels, burrowing, fire, marksman range, chrono, engineer tools, merchant boosts, safe-zone rewards, and mine bonuses.
- Playing-field controls for command mode versus drag mode, rotation, tilt, coordinate labels, full-board fit, zoom down to 35%, reset, mouse-drag panning, shift-drag rotation, and wheel zoom.
- Unit-specific animations: bombers drop bombs, Seekers scan fog, Wardens project shields, Phantoms leave mist, Teleporters fracture into light, Sentinels arm a guard stance, Burrowers kick up earth, Pyromancers raise fire, Marksmen fire projectiles, Disruptors emit cancellation waves, Chrono Units swirl time arcs, Engineers throw sparks, and Merchants spin coins.
- Single-player AI opponents with five difficulty levels: Beginner, Novice, Intermediate, Pro, and World-Class.
- Single Player has separate AI difficulty cards and commander character selection.
- Difficulty progression starts at Beginner; beating each level unlocks the next one and grants a secret phrase stored locally.
- Beginner's phrase, `Crown before conquest`, starts unlocked. Later phrases unlock in order: Novice, Intermediate, Pro, World-Class.
- Local multiplayer is supported as hot-seat play on one device. Online multiplayer is not connected to a live server yet.
- Tutorial mode starts an AI-vs-AI demonstration so the player can watch how turns, fog, economy, movement, and treasure capture work.
- Tutorial demos can be paused/resumed from the bottom HUD.
- A bottom-right guide chat widget answers local rule/tutorial questions about winning, treasure, fog, movement, mines, AI levels, units, pause, and online servers.
- The board background uses a subtle strategy-map table surface instead of pure black.
- Campaign levels map to the five AI difficulties and use the `images/Levels/` art.
- Functional settings panel with 10 options for cloud fog, territory hints, coordinates, animation speed, AI delay, high contrast, auto-fit board, move trails, turn timer, and reduced motion.
- Cloud-style fog-of-war blocks undiscovered enemy territory when Cloud Fog is enabled.
- Invalid deployment outside your own territory highlights your legal territory.
- Fog-of-war starts with only each player's own territory visible; all other unrevealed tiles are clouded.
- Treasure capture no longer eliminates the owner. Returning a rival treasure gives the capturer +500 tokens and +75 tokens per turn. A player wins by capturing all rival treasures or by being the last surviving King.

## Online Multiplayer Plan

The current browser game is not connected to production servers. To support online multiplayer, add:

- A Node WebSocket server.
- Lobby and room creation.
- Authoritative server-side game state and action validation.
- Turn timers enforced by the server.
- Player reconnect and spectator support.
- Client messages for `create_room`, `join_room`, `submit_action`, `sync_state`, and `leave_room`.
- 2, 3, and 4 player layouts with updated grid sizes: 2 players use 7x7 territories, 3 players use 8x8 territories, and 4 players use 9x9 territories.
- Chessboard-style coordinate labels start enabled and can be toggled off from the field toolbar.
- Bomb-proof royal/treasure start tiles and a central safe zone.
- Hot-seat setup and battle turns.
- 20-second battle turns, pass on timeout, +100 turn income, and escalating movement costs.
- 3D board rendering with the available `.glb` unit models.
- Unit deployment, movement, adjacent/ranged combat, fog-of-war reveal, treasure capture/return, and elimination win checks.
- Gold mine building, mine income, merchant income doubling, and mature mine retrieval bonuses.
- Engineer traps, Seeker reveal radius, Warden defense buff, Phantom mine stealing, bomber blast areas, and core special abilities.
