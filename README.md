# Fantastic Nails & Spa

# live webste: https://nail-salon-webpage.onrender.com/services

A responsive business website for **Fantastic Nails & Spa**, a nail salon located in Centralia, WA. Built with Node.js, Express, and EJS templating.

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero carousel, marketing sections, brand showcase |
| About | `/about` | Salon story, core values, team, and stats counter |
| Services | `/services` | Pricing cards for manicures, pedicures, nail enhancements, and waxing |
| FAQ | `/FAQ` | Accordion-style frequently asked questions |
| Gallery | `/gallery` | Photo gallery of nail work |

---

## Tech Stack

- **Backend:** Node.js, Express 5
- **Templating:** EJS
- **Frontend:** Bootstrap 5, custom CSS
- **Fonts:** Google Fonts (Playfair Display, Great Vibes)

---

## Getting Started

### Prerequisites
- Node.js v18+

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/FantasticNailsWebsite.git
cd FantasticNailsWebsite

# Install dependencies
npm install

# Start the development server
npm start
```

The app will run at `http://localhost:3000`.

---

## Project Structure

```
FantasticNailsWebsite/
├── index.js              # Express server entry point
├── package.json
├── public/
│   ├── images/
│   │   ├── header/       # Logo
│   │   ├── index/        # Home page images
│   │   ├── about/        # About page images
│   │   ├── services/     # Service card images
│   │   └── shared/       # Images shared across pages
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
    └── gallery.ejs
```

---

## Deployment

This project is configured for deployment on [Render](https://render.com).

- **Build command:** `npm install`
- **Start command:** `npm start`
- The server port is set dynamically via `process.env.PORT`, falling back to `3000` locally.

---

## Contact

**Fantastic Nails & Spa**
507B Harrison Avenue, Centralia, WA 98531
📞 (360) 736-4123
