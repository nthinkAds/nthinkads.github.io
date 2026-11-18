# N Think — static site (GitHub Pages)

A temporary, no-build version of the N Think website: plain HTML, CSS and JavaScript.
It uses the studio's real work and works in light and dark mode.

## What's in the folder

```
nthink-site/
├── index.html            the page
├── 404.html              shown for broken links
├── assets/
│   ├── css/style.css     all styling (colours are at the top)
│   ├── js/content.js     ← EDIT THIS: clients, figures, disciplines, projects
│   ├── js/main.js        behaviour: theme, gallery, viewer, animations
│   ├── work/<project>/   images: 01.webp (large) and 01-t.webp (thumbnail)
│   └── video/            compressed films (.mp4) and their posters (.jpg)
├── .nojekyll             tells GitHub Pages to serve files as they are
└── robots.txt
```

## Try it on your computer

Open the folder in VS Code, install the **Live Server** extension, right-click
`index.html` and choose **Open with Live Server**. (Double-clicking `index.html`
also works, but films may not preview.)

## Put it on GitHub Pages

The folder is about 60 MB, which is too much for GitHub's drag-and-drop page,
so use Git:

```bash
# 1. In a terminal, go into the site folder
cd "C:\Users\BEAZTI\Desktop\Work file\nthink-site"

# 2. Turn it into a Git repository and make the first commit
git init
git add .
git commit -m "N Think static site"

# 3. Create an empty repo on github.com called nthink-site (no README), then:
git branch -M main
git remote add origin https://github.com/alaricXshiran/nthink-site.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch →
Branch: main / (root) → Save**. After a minute or two the site is live at
`https://alaricxshiran.github.io/nthink-site/`.

To update later: edit files, then `git add .`, `git commit -m "what changed"`, `git push`.

## Common edits

- **Add a project:** make a folder in `assets/work/`, add `01.webp` + `01-t.webp` (and so on),
  then copy a block in `content.js` and list each image's width and height.
- **Feature a different project:** set `featured: true` on it (keep three).
- **Use the real logo:** replace the `<a class="wordmark">` contents in `index.html`
  with `<img src="assets/logo.svg" alt="N Think" height="28">`.
- **Change colours:** edit the two theme blocks at the top of `style.css`.

## Not in this version (comes with the Astro + Supabase build)

The admin page, saving form messages (the form currently opens the visitor's email app),
and the visitor counter.
