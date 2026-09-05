# Personal Introduction Page — NSCC Technical Task 2


**GitHub Pages:** `https://kashiffazili.github.io/NSCC-Technical-Tasks/Task-2-Personal-Introduction/`


## Overview

A responsive, futuristic personal introduction page built for the **NSCC (Newton School Coding Club) Technical Domain recruitment task**. The project uses semantic **HTML5**, custom **CSS3**, and **Vanilla JavaScript** with no framework or build step.

The design keeps the original dark, minimal visual style, including the framed square/rounded-square portrait presentation, while separating structure, styling, and behavior into clean project files.

## About Me

Hi, I’m **Mohammad Kashif Fazili**, a **1st Year, Semester 1 B.Tech Computer Science and Engineering (AI & ML)** student at **SRM Institute of Science and Technology**.

- From **Srinagar, Jammu and Kashmir**
- School: **Green Valley Educational Institute**
- Class 10: **10 CGPA**
- Class 12: **94.2%**
- Felicitated with a **gold medal and certificate** for securing **10th position across the state** in Class 10
- Completed the hands-on project in **“MCP Workshop: Build AI Automations That Work for You”** by **NXT Wave**
- Interested in **coding, AI, prompting, MCP, automation, and futuristic technology**
- Career goal: become a **technology entrepreneur** — an employer, not just an employee

## Features

- Responsive desktop, tablet, and mobile layouts
- Dark / Light mode toggle with `localStorage` persistence
- Flash-free theme restoration before paint
- Animated hero entrance and subtle background motion
- Scroll-reveal animations using `IntersectionObserver`
- Animated skill bars
- Responsive hamburger navigation
- Active navigation highlighting while scrolling
- Sticky glass-style navigation bar
- Achievement, skills, interests, MCP/future, vision, and contact sections
- Accessible focus states, skip link, ARIA labels, alt text, and reduced-motion support
- **Original supplied portrait preserved unchanged** in `assets/profile-photo.png`
- Framed square/rounded-square photo treatment with theme-adaptive gradient ring and glow
- GitHub and LinkedIn links
- Relative asset paths for GitHub Pages compatibility

## Technologies

- **HTML5** — semantic structure
- **CSS3** — custom properties, Flexbox, Grid, media queries, animations and transitions
- **Vanilla JavaScript** — DOM manipulation, events and `IntersectionObserver`
- **localStorage** — persistent theme preference

No React, Tailwind, Bootstrap, or build tools are required.

## Project Structure

```text
Task-2-Personal-Introduction/
├── assets/
│   └── profile-photo.png
├── index.html
├── style.css
├── script.js
├── README.md
├── .gitignore
├── .nojekyll
└── LICENSE
```

## Photo

The supplied `assets/profile-photo.png` is the exact portrait used in this final version. It has **not been regenerated, replaced, or visually altered** during the code cleanup.

## How to Run

### Option 1 — Open directly

Open `index.html` in a modern browser.

### Option 2 — Local server (recommended)

From inside `Task-2-Personal-Introduction/`:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Dark / Light Mode

The default theme is dark. The navbar toggle changes the `data-theme` attribute on `<html>` and saves the selected value under:

```js
"kashif-theme"
```

Refreshing the page restores the saved theme before the page paints, so the preference persists without a visible theme flash.

## Responsive Design

The layout uses fluid sizing, CSS Grid/Flexbox and media queries. Navigation becomes a hamburger menu on smaller screens, while the hero, cards, skills and footer stack safely for mobile.

## Deployment — GitHub Pages

1. Create a **public** GitHub repository named `NSCC-Technical-Tasks`.
2. Place this folder inside it as `Task-2-Personal-Introduction/`.
3. Commit and push to the `main` branch.
4. Open **Repository → Settings → Pages**.
5. Select **Deploy from a branch → main → /(root)** and save.
6. Open the live URL shown by GitHub Pages.
7. Confirm the page works and keep the verified URL in the **Live Demo** section above.

## Screenshort
`assets/demo-personal-page.png` 

## Concepts Learned

- DOM selection and manipulation
- Event listeners
- `localStorage`
- CSS custom properties for theming
- Flexbox and CSS Grid
- Responsive media queries
- `IntersectionObserver`
- CSS animations and transitions
- Semantic HTML and accessibility
- Relative paths for static GitHub Pages deployment

## Future Improvements

- Add a projects section as real projects are completed
- Add an experiments / learning gallery
- Add a blog or learning-notes section
- Add a validated contact form
- Expand AI automation experiments and write-ups

---

© Mohammad Kashif Fazili · Built with HTML, CSS & JavaScript · Exploring. Building. Creating.
