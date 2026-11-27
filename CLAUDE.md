<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan at
`specs/001-footer-built-with-note/plan.md`.

Feature: `001-footer-built-with-note` (Footer Built-With Note). Supporting design
artifacts: `specs/001-footer-built-with-note/research.md`,
`data-model.md`, `contracts/footer-credit.md`, `quickstart.md`.

Key constraints for this feature: the credit renders once per route from
`app/layout.tsx` (the only shared closing surface — the repo has no footer
component), uses only existing tokens (`text-xs text-muted-foreground`), adds no
JavaScript, no dependency, and no new file, and `pnpm lint` (biome) must exit clean.
<!-- SPECKIT END -->
