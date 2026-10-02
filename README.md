# WorksheetHub AI

Static website, no build step. Open `index.html` in a browser, or host it free on GitHub Pages.

## Setup
1. Edit `config.js`: set `githubRepo`, change `adminPassword`, and set `showSampleData: false` when going live.
2. The admin dashboard is at `index.html#/admin`.

## Suggested GitHub repo layout
worksheets/math/grade6, worksheets/math/grade7, worksheets/science/grade6, worksheets/science/grade7,
worksheets/english, worksheets/spanish, worksheets/individuals-societies, worksheets/digital-design

## Workflow
Request -> Admin > Requests -> create with AI -> review -> upload PDF to GitHub ->
Admin > Add Worksheet (paste the GitHub link) -> set the request to Completed with the link.

## Important limitation
Requests, feedback, stats and added worksheets are stored in the browser (localStorage), and the admin password is
client-side only. That is fine for a demo, but for real use by many students you need a shared backend so requests
from everyone's devices reach you (e.g. Firebase/Supabase, or a Google Form/Formspree for requests). Use Admin > Data
to export JSON backups.
