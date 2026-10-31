## Summary

<!-- 1–3 sentences: what changed and why. Link the story/issue. -->

Spec: <!-- _bmad-output/implementation-artifacts/<story>.md or #issue -->

## Decisions

<!-- Choices a reviewer might question, each with the alternative you rejected and why. -->

| Decision | Alternative | Why |
| --- | --- | --- |
|  |  |  |

## Verification

- [ ] `bun run test`
- [ ] `bunx biome check .`
- [ ] `bunx tsc --noEmit`
- [ ] E2E for affected pages (`bunx playwright test <spec>`)
- [ ] Bundle size (`npx wrangler deploy --outdir bundled/ --dry-run`) for dependency or route changes

<!-- Paste the result lines, not just ticks. Add screenshots for UI changes (light + dark, mobile + desktop). -->

## Reviewer report

<!-- Output of the `reviewer` subagent: verdict + blocking findings, or "none". -->

## Risks and follow-ups

<!-- What could break in production, anything left out of scope, anything Nam must do by hand (migrations, secrets). -->
