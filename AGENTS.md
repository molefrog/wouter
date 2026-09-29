# Working on wouter

Small, hook-based routing for React and Preact. Keep changes focused and avoid
adding runtime dependencies or unnecessary bytes.

## Layout and commands

- `packages/wouter/src/` is the shared JavaScript implementation; types live in
  each package's `types/` directory.
- `wouter-preact` copies the shared sources and keeps its own `react-deps.js`.
  Edit shared sources in `wouter`, and check both packages when changing APIs.
- Use Bun: `bun install --frozen-lockfile`, `bun test --coverage`,
  `bun run test-types`, and `bun run lint`.
- Run `bun run --cwd packages/wouter-preact prepublishOnly` before
  `bun run size`; the tests remove their temporary Preact source copies.
- Packages ship source files directly. There is no separate bundle build.
- For releases, follow [RELEASING.md](RELEASING.md). npm is used only for packing
  and publishing through GitHub Actions with trusted publishing.

## Pull request descriptions

- Start with the problem and the resulting behavior in 1–3 sentences.
- For a small fix, aim for 50–120 words. Add detail only when it helps review.
- Explain why; let the diff show which files and functions changed.
- Include an example or screenshot when it makes the change easier to understand.
- Mention material risks or compatibility changes, if any, and checks actually run.
- Skip template headings for short PRs, debugging diaries, repeated summaries,
  agent attribution, and session links.
- Keep the title specific and the description accurate as the implementation changes.
