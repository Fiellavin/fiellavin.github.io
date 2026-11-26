# CS0315 Case Study — Student Records System (BST Prototype)

Live in the browser via GitHub Pages (C# compiled to WebAssembly with Blazor), plus the original console app.

## Project layout
- `src/StudentRecords.Core` — `BinarySearchTree`, `StudentRecord`, sample data and the case study tests
- `src/StudentRecords.Console` — original console program
- `src/StudentRecords.Web` — Blazor WebAssembly site (records table, insert/update/delete/search, run tests)

## Run locally (.NET 8 SDK)
```bash
dotnet run --project src/StudentRecords.Console   # console version
dotnet run --project src/StudentRecords.Web       # website at the printed localhost URL
```

## Host on GitHub Pages
1. Push this folder to a GitHub repository (branch `main`).
2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Each push to `main` runs `.github/workflows/deploy-pages.yml`, which runs the tests, publishes the site and deploys it to `https://<user>.github.io/<repo>/`.

## Data Structure Decision
- Selected: Generic Binary Search Tree (`BinarySearchTree<TKey, TValue>`).
- Invariant: For every node, all keys in `Left` are strictly less than `node.Key`, and all keys in `Right` are strictly greater (preventing duplicates).
- Limitation: Unbalanced BST degrades to O(n) height if IDs are inserted in strictly sorted order.
- Proposed Improvement: Upgrade to a self-balancing AVL tree with single/double rotations to guarantee O(log n) height.

## Group Members & Contributions
- [Member 1]: Requirements analysis, candidate comparison, report drafting
- [Member 2]: BST design, diagrams, C# implementation
- [Member 3]: Test cases, empirical comparison, documentation & README
