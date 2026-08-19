# Angrezi Safar (انگریزی سفر)

A bilingual (Urdu/English) beginner English trainer built for PTE prep — three
gated tracks (Reading, Writing, Spoken), vocabulary with audio, and a
listen → type → speak retry loop whenever a level isn't passed. Pure static
HTML/CSS/JS — no build step, no dependencies, works fully offline once loaded
except for the Google Fonts stylesheet.

## Run it locally
Just open `index.html` in a browser (Chrome/Edge recommended for speech
features). No server needed.

## Deploy to Vercel

The Vercel CLI is already installed on this machine. Two commands, run from
this folder (`d:\PTE Training AI`):

```
vercel login
vercel --prod
```

- `vercel login` opens your browser to sign in (email, Google, or GitHub) —
  this step needs a human, it can't be automated.
- `vercel --prod` uploads this folder and gives you a live `https://...`
  link. Answer its setup questions with the defaults (Enter/Enter/Enter is
  fine) — it's a static site, nothing to configure.
- Re-run `vercel --prod` any time after editing `index.html` to push updates
  to the same link.

### Alternative: no terminal at all
1. Create a free account at vercel.com (or sign in with GitHub).
2. Push this folder to a new GitHub repo.
3. On vercel.com → **Add New… → Project → Import** that repo → Deploy.
   Framework preset: "Other" / static — no build command needed.

## Editing the content

Everything — vocabulary, Urdu meanings, example sentences, and exercises —
lives in the `STAGES` array near the top of the `<script>` tag in
`index.html`. Each stage (`reading` / `writing` / `spoken`) has a `levels`
array; each level has a `vocab` list and an `exercises` list. Add more
levels/words by following the existing pattern — the app (progress bar,
locking, scoring, review loop) works automatically off this data.

Progress is saved in the browser's `localStorage`, per device/browser.
