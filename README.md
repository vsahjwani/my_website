# vani's archive 📌

A pinboard portfolio. The landing page is a sheet of paper; scrolling tears it
away to reveal a corkboard where every pinned item opens a section.

**The pinboard is live HTML — there are no animation frames.** Edit the board
once in `index.html` and the tear animation stays in sync automatically.

## run it locally

```bash
python3 -m http.server 8642 --directory .
# → http://localhost:8642
```

## make it yours (placeholder checklist)

- [ ] `assets/me.jpg` — drop in a photo and the hero polaroid picks it up automatically
- [ ] LinkedIn URL — search `YOUR-HANDLE-HERE` in `index.html` (2 places)
- [ ] GitHub URL — search `YOUR-GITHUB`
- [ ] Email + phone — in the `#sheet-contact` section
- [ ] Projects — cards in `#sheet-projects`
- [ ] Internships — receipt rows in `#sheet-internships`
- [ ] Coursework — list in `#sheet-coursework`
- [ ] Art & photos — swap the grey `.ph.big` squares for `<img>` tags, e.g.
      `<img src="assets/painting1.jpg" alt="...">` inside each `.gal-polaroid`
- [ ] About-me bio — `#sheet-about`

## add / move things on the board

Every pinned item positions itself with inline CSS variables:

```html
<a class="item postit pink" href="#contact"
   style="--x:3%; --y:80%; --w:130px; --r:3deg;">
```

- `--x` / `--y` — position (% of the board)
- `--w` — width
- `--r` — rotation

Phone layouts are overridden at the bottom of `css/style.css`
(`@media (max-width:720px)`) so you can pin things differently on small screens.

## structure

```
index.html      the board + all section sheets (edit content here)
css/style.css   all styling & textures (cork + paper are pure CSS/SVG)
js/main.js      tear animation · calendar · sudoku · routing
assets/         your images (me.jpg, art photos, …)
```
