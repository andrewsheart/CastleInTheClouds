# Living Better, Together — website

A five-page site for the community manifesto by Berend Custers and Andrew Stenger.
Open `index.html` in any browser to view it. Everything it needs is in this folder.

## Pages
- `index.html` — Home: cover, mission, the three circles, ways to take part, founders, invitation
- `manifesto.html` — the full manifesto, with Part I and Part II as tabs
- `explore.html` — Watch (Berend's YouTube), Read (the book), Gather (calls), Practice
- `about.html` — Berend's and Andrew's bios
- `join.html` — the invitation and the Create account / Sign in form

Shared files live in `assets/`: `site.css` (all styling), `site.js` (links and the join form),
`cover.jpg` (the cover artwork) and `andrew.jpg`.

## Publishing to Netlify
Drag this whole Website folder onto the project's Deploys page:
https://app.netlify.com/projects/living-better-together/deploys
The new version replaces the old one in a few seconds.

## Things to fill in
1. **Berend's YouTube channel, the book page, and the practices page.**
   Open `assets/site.js`, find `const LINKS = {` and paste each URL between the quotes.
   The matching "coming soon" labels turn into working links on every page.
2. **Berend's bio and photo.** In `about.html`, search for `Berend’s biography is on its way` and
   replace that paragraph. For a photo, save it as `assets/berend.jpg` and swap the `BC` monogram
   block (in `about.html` and `index.html`) for an `<img>` like Andrew's.
3. **Community name and launch details** in the footer of each page once they're decided.

## Accounts (the Join form)
The Create account / Sign in form is a working front end with validation, but it is a preview:
it stores and sends nothing. To make accounts real, connect an auth provider. The form already
calls two functions in `assets/site.js`, `Membership.signUp` and `Membership.signIn`, so only those
need replacing. With Supabase, for example:

    supabase.auth.signUp({ email, password, options: { data: { username } } })
    supabase.auth.signInWithPassword({ email, password })

Never store passwords yourself; let the auth provider handle hashing, email verification, and resets.
