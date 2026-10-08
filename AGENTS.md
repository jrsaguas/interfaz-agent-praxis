<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## PRAXIS architecture
- Use a shared StudioProvider for session-only mock runs, approvals, and global controls; no backend is required for this prototype.
- Keep the cockpit shell in the root layout and operational modules behind a validated dynamic section route; each section has a unique URL and metadata.
- Define all visual roles in src/styles.css and use the existing Button for controls; dynamic inline values are reserved for graph positions, zoom, and data-driven chart geometry.
- Keep domain mock data and focused view modules under src/components/praxis; this separates navigation, execution state, catalog data, and specialized operational experiences.