# FrostBound Bots

FrostBound Bots is a single-player ice-sliding puzzle. Guide the target robot onto its matching target tile in as few moves as possible. Each chapter starts with a random 16 × 16 board and four robots: Ruby (red), Mint (green), Volt (yellow), and Byte (blue).

## Run the game

From the project directory, install dependencies with `npm ci` and start Vite with `npm run dev`. Open the local URL printed in the terminal. Use `npm run build` to build the production site and `npm run preview` to serve that build locally.

## How to Play

1. Read the round objective to identify the target robot and its tile. Click or tap any robot on the board or in the list, or press **1–4**.
2. Choose a direction with the keyboard arrows or the on-screen arrows. Robots slide until they hit a wall, the edge of the board, or another robot. Use the other robots to help the target robot stop on its target tile.
3. Each successful slide adds one to **Your Moves**, regardless of distance or robot. Crossing the tile is allowed. The round ends only when the target robot stops on it. **Minimum Moves** is measured from the start of the round.

| Control | What it does |
|---|---|
| Hint | Shows the first robot and direction on a shortest path from the current positions. |
| Solve | Opens **Choose a Search Algorithm**. Select BFS, IDDFS, or A* to find a path during **Search Exploration** and watch each move during **Solution Playback**. |
| Undo | Takes back one completed move. |
| Restart Round (R) | Restores the positions at the start of this round and clears move history. |
| Next Round | Starts from the four final positions on the same board with a new target robot–tile pair. |
| New Game | Generates a new chapter. |

Refreshing the page restores the first round of the active chapter, including its target tile and minimum. Chapters saved by earlier versions are supported on the same browser origin. The standalone 8 × 8 prototype in `prototype/index.html` demonstrates the two-move test puzzle.

## Search and verification

| Algorithm in the Solve menu | Status | How it searches |
|---|---|---|
| Breadth-First Search (BFS) | Available | Uses the same slide rules as the player and explores robot positions in increasing move count. The first solution found takes the fewest moves. |
| Iterative Deepening Depth-First Search (IDDFS) | Available | Repeats a depth-first search with an increasing move limit, looking for a one-move solution first, then a two-move solution, and so on. |
| A* Search | Unavailable | Prioritizes positions by adding the moves already taken to an estimate of the moves still needed to reach the target tile. |

**Search limit reached** means the time or state budget ran out with work remaining. **No solution from this position** means the queue was exhausted.

Run `npm test` for movement, BFS and IDDFS tests. Run `npm run test:browser` for Playwright checks using local Chrome, including touch controls, chapter restoration and solution replay. The browser suite records screenshots and reproducible search measurements in `evaluation/`. See the [product requirements and acceptance criteria](PRD_FrostBound_Bots.md) for the full algorithm, rules and evaluation procedure.
