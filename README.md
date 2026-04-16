# Fantastic Nails & Spa

> A responsive business website for a nail salon located in Centralia, WA.

🌐 **Live Site:** [nail-salon-webpage.onrender.com](https://nail-salon-webpage.onrender.com)

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero carousel, marketing sections, brand showcase |
| About | `/about` | Salon story, core values, team, and stats counter |
| Services | `/services` | Pricing cards for manicures, pedicures, nail enhancements, and waxing |
| FAQ | `/FAQ` | Accordion-style frequently asked questions |
| Gallery | `/gallery` | Filterable photo gallery with lightbox |
| Contact | `/contact` | Contact form with email delivery via Nodemailer |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Templating | EJS |
| Styling | Bootstrap 5 + Custom CSS |
| Email | Nodemailer + Gmail SMTP |
| Fonts | Google Fonts (Playfair Display, Great Vibes) |
| Hosting | Render |

---

## Getting Started

### Prerequisites
- Node.js v18+

### Installation

```bash
# Clone the repository
git clone https://github.com/WorkLikeBee/Nail-Salon-Webpage.git
cd Nail-Salon-Webpage

# Install dependencies
npm install

# Start the development server
npm start
```

The app runs at `http://localhost:3000`.

---

## Environment Variables

Create a `.env` file in the project root:

```
EMAIL_ADMIN=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
```

> `EMAIL_PASS` must be a [Gmail App Password](https://myaccount.google.com/apppasswords) — not your regular Gmail password. Requires 2-Step Verification enabled on your Google account.

---

## Project Structure

```
Nail-Salon-Webpage/
├── index.js                  # Express server & routes
├── package.json
├── .env                      # Email credentials (not committed)
├── public/
│   ├── images/
│   │   ├── header/           # Logo
│   │   ├── index/            # Home page images
│   │   ├── about/            # About page images
│   │   ├── services/         # Service card images
│   │   ├── gallery/          # Gallery photos
│   │   └── shared/           # Images shared across pages
│   ├── scripts/
│   │   └── main.js
│   └── styles/
│       └── main.css
└── views/
    ├── partials/
    │   ├── header.ejs
    │   └── footer.ejs
    ├── index.ejs
    ├── about.ejs
    ├── services.ejs
    ├── FAQ.ejs
    ├── gallery.ejs
    └── contact.ejs
```

---

## Deployment on Render

| Field | Value |
|---|---|
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Environment Variables** | Add `EMAIL_ADMIN` and `EMAIL_PASS` in Render dashboard → Environment |

---

## Contact

**Fantastic Nails & Spa**  
507B Harrison Avenue, Centralia, WA 98531  
📞 (360) 736-4123