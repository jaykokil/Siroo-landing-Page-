# SIROO landing page

```
index.html                 the page — all text lives here
assets/css/styles.css      all styling, including the colour palette
assets/js/main.js          config block at the top, then behaviour
assets/img/                photos and artwork
assets/video/              put your two video files here
```

To preview locally, from this folder run `python3 -m http.server 8000`, then open
<http://localhost:8000>. Opening `index.html` directly by double-clicking also works,
though some browsers block video from `file://`.

---

## 1. Before you go live — three things

Open `assets/js/main.js`. The first block is `CONFIG`, and it's the only part you
need to touch.

```js
var CONFIG = {
  formEndpoint: '',              // ← where demo requests go. See section 4.
  whatsapp: '91XXXXXXXXXX',      // ← your WhatsApp business number, digits only
  videos: { ... }                // ← see section 3
};
```

**While `formEndpoint` is empty, demo requests go nowhere.** The form still shows a
thank-you, but nothing is delivered, and a warning is logged to the browser console.
Don't launch like that.

---

## 2. Changing text

All copy is in `index.html`. Open it in any editor and search for the words you want
to change.

| What | Search for |
|---|---|
| Headline | `Take control of` |
| Every Bottle / Drop / Time | `Every Bottle` |
| Hero stat cards | `Inventory Accuracy` |
| Feature cards | `Reduce Inventory Leakage` |
| Dashboard checklist | `Live inventory across every outlet` |
| How-it-works steps | `Scan the bottle` |
| Kit bullets | `Precision weighing scale` |
| Keg figures | `Sold this cycle` |
| Report table | `Glenfiddich 12` |
| Testimonials | `Rahul Mehta` |
| FAQ | `Do I need the weighing scale` |
| CTA | `Ready To Take Control` |
| Footer | `<h4>Product</h4>` |

The bottles in the How-it-works animation are in `assets/js/main.js` — search for
`var POURS`. Each entry is `{name, meta, label, size, left}`, where `size` is the
bottle in ml and `left` is how much remains after the pour.

---

## 3. The two videos

Put your files in `assets/video/`, then point `CONFIG.videos` at them:

```js
videos: {
  hero:   { title: 'SIROO overview',  src: 'assets/video/siroo-overview.mp4',  poster: '', blurb: '…' },
  action: { title: 'SIROO in action', src: 'assets/video/siroo-in-action.mp4', poster: '', blurb: '…' }
}
```

- `hero` plays from the **Watch Video** button in the hero.
- `action` plays from the big play button in the **Watch SIROO In Action** band.

You can use a YouTube or Vimeo URL instead of a file — paste the normal link and the
player switches to an embed automatically:

```js
src: 'https://www.youtube.com/watch?v=abc123'
```

**Recommendation:** host on YouTube or Vimeo rather than uploading MP4s here. A
two-minute 1080p MP4 is 30–60 MB, which is slow on mobile data and will cost you
bandwidth on every view. YouTube handles the compression, adaptive quality and
streaming for free. Use `assets/video/` only for short clips.

`poster` is an optional still shown before playback — put a JPG in `assets/img/`
and reference it as `assets/img/your-poster.jpg`.

---

## 4. Receiving demo requests

The form collects: **name, phone, outlet name, number of outlets, city**. Pick one
of these and put the URL in `CONFIG.formEndpoint`.

### Option A — a form service (fastest, no code)

Sign up at [Web3Forms](https://web3forms.com) or [Formspree](https://formspree.io),
both of which have a free tier, and paste the endpoint they give you:

```js
formEndpoint: 'https://api.web3forms.com/submit'
```

For Web3Forms you also need to add your access key to the payload — in `main.js`
find `var payload = {` and add a line:

```js
access_key: 'your-key-here',
```

You'll get an email per submission. This is the right choice if you just want
notifications and nothing else.

### Option B — your own SIROO backend (recommended)

You already run Node + Express + MongoDB, so leads can live in the same database as
everything else. Add this to `server.js`:

```js
const demoRequestSchema = new mongoose.Schema({
  name: String, phone: String, outlet: String,
  outlets: String, city: String, source: String,
  status: { type: String, enum: ['new','contacted','demoed','won','lost'], default: 'new' },
  at: { type: Date, default: Date.now },
}, { timestamps: true });
const DemoRequest = mongoose.model('DemoRequest', demoRequestSchema);

// public — no auth, it's a marketing form
app.post('/api/demo-request', async (req, res) => {
  try {
    const { name, phone, outlet, outlets, city, source } = req.body;
    if (!name?.trim() || !phone?.trim())
      return res.status(400).json({ error: 'Name and phone are required' });

    const lead = await DemoRequest.create({
      name: name.trim(), phone: phone.trim(),
      outlet: outlet?.trim(), outlets, city: city?.trim(), source,
    });
    // TODO: notify yourself here — email, WhatsApp API, or a Slack webhook
    res.json({ ok: true, id: lead._id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// simple list for you to review
app.get('/api/demo-requests', authMiddleware, async (req, res) => {
  res.json(await DemoRequest.find({ userId: undefined }).sort({ at: -1 }).limit(200));
});
```

Then set:

```js
formEndpoint: 'https://your-api-domain.com/api/demo-request'
```

Two things to get right:

1. **CORS.** If the site and the API are on different domains, the browser will block
   the request. Your `server.js` already uses `cors()`, so confirm it allows your
   site's origin.
2. **Notification.** Saving to the database doesn't tell you anything happened. Add an
   email (Nodemailer), a Slack webhook, or a WhatsApp Business API message where the
   `TODO` is — otherwise you'll only find leads if you go looking.

### Option C — a Google Sheet

Google Apps Script can append rows and email you. Free and easy to review, but you'll
be maintaining a script rather than using your own stack.

### The WhatsApp button

This works with no backend at all. It opens a chat with your number and pre-fills a
message. Many restaurant owners will use this over the form, so make sure
`CONFIG.whatsapp` is correct even if you set up nothing else.

---

## 5. Changing images

Drop a replacement into `assets/img/` **using the same filename** and it appears — no
code changes. Keep roughly the same proportions or the crop will shift.

| File | Where it shows | Notes |
|---|---|---|
| `bottle-hero.webp` | Hero bottle | Needs a transparent background |
| `bottle-howitworks.webp` | Draining bottle | Transparent; liquid should fill the body |
| `hero-background.jpg` | Behind the hero | Wide, dark, ~1500px |
| `bottle-rail.jpg` | Scrolling rail | See the warning below |
| `stats-strip.jpg` | The ±2 ML / 12 S strip | Text is baked in |
| `feature-*.jpg` | The three cards | 8:5 crop |
| `kit-box-*.jpg` | Hardware photos | |
| `logo.jpg` | Nav and footer | |

**The rail is the fiddly one.** It scrolls by translating exactly one tile width, so
if you change the image's proportions the loop will visibly jump. If you swap it,
tell me the new file and I'll recalculate the two numbers in `styles.css`
(`background-size` and the `railL` keyframe) — they must match.

**The stats strip has its text baked into the picture.** Changing "12 S" to "10 S"
means a new image. Say the word and I'll rebuild that strip in HTML so the numbers
are editable text again — it looked identical before you supplied the artwork.

---

## 6. Changing colours

Everything comes from one block at the top of `assets/css/styles.css`:

```css
--ember:#d98126;   /* main amber — buttons, accents */
--gold:#e8c259;    /* highlights, the mantra */
--gold-lt:#f7eeba; /* brightest highlight */
--copper:#c2621a;  /* deeper amber */
--amber:#e8c89a;   /* body text */
--paper:#fdf6e6;   /* headings */
--ink:#080401;     /* page background */
```

Change these and the whole page follows. These were sampled from the SIROO bottle.

---

## 7. Deploying

It's a static site, so anything works. Drag this folder onto
[Netlify Drop](https://app.netlify.com/drop) or connect it to Vercel or Cloudflare
Pages — all free for this. Or upload the folder to any web host's `public_html`.

Keep `assets/` next to `index.html`; the paths are relative.

---

## Still to do before launch

- [ ] Set `CONFIG.formEndpoint` — **leads are lost until this is done**
- [ ] Set `CONFIG.whatsapp` to your real number
- [ ] Upload the two videos and point `CONFIG.videos` at them
- [ ] Replace the three testimonials — the current ones are written placeholders
      with invented names
- [ ] Replace the stat figures (±2 ML, 12 s, 3 hrs, 99%, 25%, 80%) with numbers you
      have actually measured, since you'll be asked to defend them on a demo call
- [ ] Check `feature-smarter-operations.jpg` — it shows a drink-dispensing machine
      with legible third-party brands (Jim Beam, Bombay Sapphire, Jack Daniel's),
      which is both off-message for SIROO and a trade-dress risk
- [ ] Reconsider the "Reduced Losses 25% / −18%" card — a downward delta on a losses
      metric reads ambiguously
