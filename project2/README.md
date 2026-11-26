# CS0315 Case Study — Student Records System

Live in the browser via GitHub Pages, plus the original console app.

## Project layout
- `src/StudentRecords.Core` — `BinarySearchTree`, `StudentRecord`, sample data and the case study tests
- `src/StudentRecords.Console` — original console program
- `src/StudentRecords.Web` — Blazor WebAssembly site (records table, insert/update/delete/search, run tests)

## Data Structure Decision
- Selected: Generic Binary Search Tree (`BinarySearchTree<TKey, TValue>`).
- Invariant: For every node, all keys in `Left` are strictly less than `node.Key`, and all keys in `Right` are strictly greater (preventing duplicates).
- Limitation: Unbalanced BST degrades to O(n) height if IDs are inserted in strictly sorted order.
- Proposed Improvement: Upgrade to a self-balancing AVL tree with single/double rotations to guarantee O(log n) height.

## Group Members & Contributions
- Esad Enis Arslan: Requirements analysis, candidate comparison, report drafting
- Furkan Yiğit Kaya: BST design, diagrams, C# implementation
- Murat Tatlı: Test cases, empirical comparison, documentation & README
