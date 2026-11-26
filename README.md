# FrostBound Bots

FrostBound Bots is a single-player puzzle game played on a 16 × 16 ice board. The goal is to move the designated robot to the target square in as few moves as possible. You can control four robots: Ruby (red), Mint (green), Volt (yellow), and Byte (blue). Position the other robots as blockers to help the target robot stop on the right square.

## Running the project

```sh
npm ci
npm run dev
```

Open the local URL that Vite prints in the terminal. Use `npm run build` to create a production build and `npm run preview` to preview it locally.

## How to play

Select a robot with a click, a tap, or the **1–4** keys, then move it with the arrow keys or the on-screen controls. A robot slides in a straight line until it is blocked by a wall, the edge of the board, a blocked ice square, or another robot. Each slide that changes the robot’s position counts as one move. The round ends when the target robot **stops** on the target square.

| Control | Function |
| --- | --- |
| **Hint** | Shows which robot to move and in which direction for the first move of a shortest solution from the current position. |
| **Solve** | Runs BFS, IDDFS, or A*, then visualizes the search and plays back the solution if one is found. |
| **Undo** | Reverses the last move. |
| **Restart Round (R)** | Resets the robots to their starting positions for the round and clears the move history. |
| **Next Round** | Starts the next round on the same board with a new target, using the four robots’ final positions. |
| **New Game** | Creates a chapter with a new board and new starting positions. |

**Your Moves** counts the player’s moves in the current round. **Minimum Moves** shows the length of the shortest solution from the round’s starting positions. Reloading the page returns you to the first round of the chapter saved in the browser.

## Modeling the search space

A state stores the positions of **all four** robots in a fixed order, `[Ruby, Mint, Volt, Byte]`. The other robots’ positions help determine where the target robot can stop. Two states with the target robot in the same position can have different available moves.

The board and goal stay fixed throughout a search. From each state, the solver tries up to 16 actions by pairing each of the four robots with each of the four directions. Every action uses the same [slide](src/core/movement.js) function as the game. The function caches a board adjacency table that accounts for walls and blocked squares, then checks the robots’ positions as it traverses the board one square at a time. The solver skips actions that leave the robot in place. Each successful slide forms an edge with a cost of one in the state graph, so the shortest solution uses the fewest slides.

The squares on a 16 × 16 board can be represented by indices 0–255. The solver combines the four indices as base-256 digits to create a unique numeric key for each arrangement of robots. A state meets the goal when the target robot’s position index matches the target square’s index.

### Breadth-First Search (BFS)

[BFS](src/algorithms/bfs.js) uses a first-in, first-out (FIFO) queue to process states in order of move count. It processes the initial state, then states reached in one move, two moves, and so on. Because every edge has the same cost, the first goal state found gives the minimum number of moves.

The solver adds each new state to `seen` when it enqueues it. If the same arrangement appears again through another sequence of moves, the solver skips it. Each queue entry stores its parent index and the action used to reach it. When the solver finds the goal, it follows the parent links backward and reverses the action sequence. The queue and the set of discovered states grow as the search explores more of the graph.

### Iterative Deepening Depth-First Search (IDDFS)

[IDDFS](src/algorithms/iddfs.js) runs depth-limited searches with limits of 0, 1, 2, and so on. In each iteration, the solver explores branches using a stack. When it reaches the depth limit, it backtracks to try the next option. The `onPath` set prevents cycles on the current path. When the solver finds the goal, the actions on the stack and the final action form the solution.

The first depth limit that yields a solution equals the length of the shortest solution. The active stack grows with depth. The implementation also keeps a set of states to detect search exhaustion and a trace for animation. The solver can revisit shallow states as the limit increases, so it may use up its search budget before reaching the solution depth.

### A* Search

[A*](src/algorithms/astar.js) uses a min-heap to select the state with the lowest `f = g + h`. Here, `g` is the number of moves from the initial state, and `h` estimates the remaining moves. When states have the same `f` value, the heap prioritizes the one with the lower `h`. The `bestG` map stores the lowest cost found so far for each state.

The heuristic adds one if the target robot’s row differs from the target square’s row and one if the columns differ. The value is 0 when the robot is at the target, 1 when only one coordinate differs, and 2 when both differ. A slide changes only one coordinate, so this estimate is a lower bound on the actual cost. The solver checks walls and the positions of other robots when generating moves. The heuristic sets queue priorities and omits any extra moves needed to position the other robots.

## How the game uses the algorithms

- **Round generation.** The generator creates L-shaped walls in different sectors of the board and places the robots on four distinct squares outside the blocked central area. BFS explores states from the initial positions to collect reachable robot and target square pairs. The depth at which it first finds each pair becomes that pair’s **Minimum Moves** value. The game chooses a target at random from the candidates found.
- **Hints.** When the player presses **Hint**, BFS searches for a solution from the current arrangement of robots. The first move may position another robot to provide a stopping point.
- **Visualization.** **Solve** takes up to 100 samples from the search trace to display in **Search Exploration**. If the solver finds a solution, **Solution Playback** shows the sequence of slides that brings the robot to the target.

Each search for round generation has a budget of 900 expansions or 100 ms. Searches for **Hint** and **Solve** have a budget of 20,000 expansions or 750 ms. The game splits the work into short time slices so the browser stays responsive. A `limited` status means the search reached its budget with states left to explore. An `exhausted` status means the search explored the entire space reachable from the initial state.

### Two-move solution example

On the [8 × 8 test board](tests/fixtures/exampleBoard.js), Ruby starts at index 8 and its target is at index 11. Mint starts at index 4.

1. Move **Mint down**. The wall between indices 12 and 20 makes Mint stop at index 12.
2. Move **Ruby right**. Mint blocks index 12, so Ruby stops at index 11.

The same example is available in the [prototype](prototype/index.html).

## Testing

- `npm test` runs tests for slide rules, BFS, IDDFS, and search trace sampling.
- `npm run test:browser` runs Playwright with a local installation of Chrome and tests touch controls, chapter restoration, and solution playback.
- The [evaluation](evaluation/) folder contains screenshots and search performance measurements from fixed-seed test boards.
