# A Mobile Research App for Post-COVID Fatigue Monitoring

<p align="center">
    <img src="https://raw.githubusercontent.com/BigDataInMedicine/COVISION-PWA/main/app/src/logo.svg?raw=true" 
       alt="COVISION-PWA Logo" 
       width="250" />
</p>

> **A progressive web application (PWA) for longitudinal symptom monitoring in post-COVID patients.**  
> Designed to capture fluctuating fatigue and cognitive symptoms in daily life with minimal cognitive load.

---

## 🎯 Overview

COVISION-PWA is a **mobile-first, offline-capable research app** built with React and designed as a **Progressive Web Application (PWA)**. It enables longitudinal monitoring of post-COVID symptoms (e.g., fatigue, mood, cognitive performance) in real-world settings.

### ✅ Key Features

- ✅ **Offline-first**: Works without internet (data stored locally)
- ✅ **Flexible testing times**: No fixed schedule, user-driven
- ✅ **Audio recording**: For memory and Stroop tasks
- ✅ **Minimalist UI**: Reduces cognitive load
- ✅ **Secure data storage**: Local IndexedDB + localStorage
- ✅ **Server-side validation**: Code-based access control
- ✅ **Easy deployment**: Ready for production on any PHP server

---

## 🛠️ Local Development

### Prerequisites

- Node.js (v16 or higher)
- npm (or yarn)

### Setup

```bash
# Clone the repository
git clone https://github.com/BigDataInMedicine/COVISION-PWA.git
cd COVISION-PWA

# Install dependencies
npm install

# Start development server
npm run dev
```

> Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build the app
npm run build

# Output: `build/` directory
```

> This creates static files ready for deployment.

---

## 🖥️ Server Deployment

### Required Files

The following files must be uploaded to your server (e.g., `https://covision-app.uol.de/`):

| File/Directory                      | Purpose               |
| ----------------------------------- | --------------------- |
| `build/`                            | Compiled React app    |
| `server/check_code.php`             | Validates test codes  |
| `server/upload.php`                 | Uploads test data     |
| `server/database/database_demo.csv` | Demo data for testing |

### Deployment Steps

1. Build the app: `npm run build`
2. Upload `build/` to your server root (e.g., `public_html/` or `www/`)
3. Upload `server/` to the same root
4. Ensure PHP is enabled and `upload.php` is accessible
5. Test: Visit `https://yourdomain.com/` → should load the app

> ✅ **Note**: The app uses `localStorage` and `IndexedDB` for offline storage. No server-side user accounts are needed.

---

## 🔐 API Endpoints

### `GET /check_code.php?code=ABC123`

Validates a test code and returns metadata.

**Request:**

```http
GET /check_code.php?code=ABC123
```

**Response (success):**

```json
{
  "markerIdentifier": "ABC123",
  "language": "de",
  "markerTestTime1": "10:00:00",
  "markerTestOrder1": "word1",
  ...
}
```

**Response (error):**

```json
{ "error": "Code nicht gefunden" }
```

---

### `POST /upload.php`

Uploads test data (audio, JSON, metadata).

**Request:**

```http
POST /upload.php
Content-Type: multipart/form-data

Form Data:
- code: ABC123
- files[]: audio.webm (base64 encoded)
- files[]: test_1.json
```

**Response (success):**

```json
{
  "success": true,
  "files": ["audio.webm", "test_1.json"]
}
```

**Response (error):**

```json
{
  "success": false,
  "message": "Error saving file: audio.webm"
}
```

---

## 📁 Project Structure

```
COVISION-PWA/app/
├── public/                 # Static assets (logo, index.html, manifest.json)
│   ├── images/             # Screenshots for introduction
│   ├── tests/              # Test content for memory and stroop
├── src/                    # React components, hooks, context
│   ├── components/         # Reusable UI (Button, Slider, Checkbox)
│   ├── context/            # Theme, PageContext
│   ├── db/                 # IndexedDB wrapper
│   ├── hooks/              # Hooks for colors and styles
│   ├── images/             # In-App icons
│   ├── localization/       # i18n (en, de, sv)
│   └── screens/            # All test and questionnaire screens
│   └── styles/             # Colors
├── package.json            # npm scripts
```

---

## 📊 Data Flow

```
User → App (React) → Local Storage → Test → Upload → PHP → Server → Database
```

- **Local**: `sessionStorage`, `localStorage`, `IndexedDB`
- **Server**: `database.csv`, `uploads` (CSV for codes, uploads folder for results)
- **Security**: No user accounts. Access via test code only.

---

## 📄 License

MIT License – see [LICENSE](LICENSE)

---

## 📬 Contact

For questions or collaboration:  
[Marcel Weber] <marcel.weber@uol.de>  
[Big Data in Medicine] – University of Oldenburg, Germany

---

> ✅ **This project is open-source and ready for research use.**  
> Use it to build your own longitudinal symptom monitoring study!
