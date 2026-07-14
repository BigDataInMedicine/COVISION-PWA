# A Mobile Research App for Post-COVID Fatigue Monitoring

<p align="center">
    <img src="https://raw.githubusercontent.com/BigDataInMedicine/COVISION-PWA/main/app/src/logo.svg?raw=true" 
       alt="COVISION-PWA Logo" 
       width="250" />
</p>

> **A progressive web application (PWA) for longitudinal symptom monitoring in post-COVID patients.**  
> Designed to capture fluctuating fatigue and cognitive symptoms in daily life with minimal cognitive load.

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21278265.svg)](https://doi.org/10.5281/zenodo.21278265)

---

## 🎯 Overview

COVISION-PWA is a **mobile-first, offline-capable research app** built with React and designed as a **Progressive Web Application (PWA)**. It enables longitudinal monitoring of post-COVID symptoms (e.g., fatigue, mood, cognitive performance) in real-world settings.

### ✅ Key Features

- ✅ **Flexible Test Administration**: Participants can set the duration of each assessment and terminate it at any step
- ✅ **Accessibility and Offline Usage**: The PWA can be used anywhere and at any time
- ✅ **Minimizing Cognitive Load**: The app emphasizes visual over textual instructions and show short, clear instructions
- ✅ **Modern, Minimalistic Design**: Focus on a few simple colors and avoids unnecessary animations or scrolling
- ✅ **Personalized Input and Data Reuse**: Previously
  entered items are suggested for selection

---

## 💻 System Requirements and Compatibility

The application is implemented as a Progressive Web Application (PWA) and therefore runs on all modern operating systems using a standards-compliant web browser.

### Supported platforms

- Windows
- macOS
- Linux
- Android
- iOS / iPadOS

### Supported browsers

The application has been developed and tested on:

- 5 Android devices / smartphones (Version 12 - 16)
- 6 iOS devices / smartphones (Version 15 - 18)

Because it follows standard web technologies, it is expected to work with all modern browsers supporting Progressive Web Applications.

---

## 🛠️ Local Development

Local Development refers to running the application on a developer's own computer for testing, debugging, or further development. This setup is intended for developers who want to modify the source code before deploying the application to a web server.

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

> Open the server URL displayed in the console in your browser.

If you want to test the application on your local computer set the `debug` variable in `Home.tsx` true. With setting the variable true, you are not forced to install the application. Also you test the application on your local computer without setting up a server, just use the `Demo` Code. For more Information see Demo Instructions.

### Build for Production

```bash
# Build the app
npm run build

# Output: `build/` directory
```

> This creates static files ready for deployment.

---

## 🖥️ Server Deployment

Server Deployment describes how to install the production version of the application on a web server so that it can be accessed by study participants via a web browser. After deployment, users only need the application URL and do not need to install any additional software.

> **Note:** Before deployment, configure the **server_url** in the application to match your server and generate the production build (build/) by following the instructions in the **Local Development** section.

### Server Requirements

The production server should provide:

- PHP 8.2
- File system write permissions for the `uploads/` and `queue/` directories
- HTTPS (recommended, required for full PWA functionality)
- A standard web server such as Apache or Nginx

### Required Files

The following files must be uploaded to your server (e.g., `https:///yourdomain.com/`):

| File/Directory                      | Purpose                                    |
| ----------------------------------- | ------------------------------------------ |
| `build/`                            | Compiled React app                         |
| `queue/`                            | Stored phone numbers and times to send sms |
| `uploads/`                          | Exported user data                         |
| `server/check_code.php`             | Validates test codes                       |
| `server/upload.php`                 | Uploads test data                          |
| `server/database/database_demo.csv` | Demo data for testing                      |
| `server/add_phone_number.php`       | Add new user phone number to sms queue     |
| `server/send_sms.php`               | Calls API to send sms                      |
| `server/sms_code_valid.php`         | Validate sent sms code                     |

Please make sure that every file has the permissions to access the relevant folders and files.

### Deployment Steps

1. Build the app: `npm run build`
2. Upload content of `build/` to your server root (e.g., `public_html/` or `www/`)
3. Upload content of `server/` to the same root
4. Ensure PHP is enabled and files are accessible
5. Test: Visit `https://yourdomain.com/` → should load the app

> ✅ **Note**: The app uses offline storage and test codes. No server-side user accounts are needed.

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

### `GET /add_phone_number.php?to=%2B491701234567&code=ABC123&key=PARTICIPANT_KEY`

Add phone number and creates or updates a participant queue for scheduled marker tests.

**Request:**

```http
GET /add_phone_number.php?to=%2B491701234567&code=ABC123&key=PARTICIPANT_KEY
```

**Response (success):**

```json
{
  "success": true,
  "message": "Queue updated successfully.",
  "file": "+491701234567.csv",
  "entries": 7
}
```

**Response (error – missing parameters):**

```json
{
  "success": false,
  "message": "The parameters ?to, ?code and ?key are required."
}
```

**Response (error – invalid phone number):**

```json
{
  "success": false,
  "message": "The phone number must start with '+'."
}
```

**Response (error – participant not found):**

```json
{
  "success": false,
  "message": "The specified key was not found in the database."
}
```

**Response (error – phone number already assigned):**

```json
{
  "success": false,
  "message": "This phone number is already assigned to another key and both status flags are set to true."
}
```

**Response (error – key already assigned):**

```json
{
  "success": false,
  "message": "This key is already assigned to another queue and its second status flag is set to true."
}
```

---

### `GET /sms_code_valid.php?to=%2B491701234567&key=PARTICIPANT_KEY`

Sets the phone number as valid and ready to recieve sms.

**Request:**

```http
GET /sms_code_valid.php?to=%2B491701234567&key=PARTICIPANT_KEY
```

**Response (success):**

```json
{
  "success": true,
  "message": "Code confirmed. The second status flag has been set to true.",
  "file": "+491701234567.csv"
}
```

**Response (error – missing parameters):**

```json
{
  "success": false,
  "message": "The parameters ?to and ?key are required."
}
```

**Response (error – queue not found):**

```json
{
  "success": false,
  "message": "No queue file was found for the specified phone number."
}
```

**Response (error – invalid queue file):**

```json
{
  "success": false,
  "message": "The queue file is empty or invalid."
}
```

**Response (error – key mismatch):**

```json
{
  "success": false,
  "message": "The provided key does not match the queue file."
}
```

---

## 📁 Project Structure (App)

```
COVISION-PWA/app/
├── public/                 # Static assets (index, manifest)
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

- **Local**:
  - `sessionStorage`: temporary storage
  - `localStorage`: setting storage
  - `IndexedDB`: persistent storage / ready to export
- **Server**: `database.csv`, `uploads` (CSV for codes, uploads folder for results)
- **Security**: No user accounts. Access via test code only.

---

## 🧪 Demo Instructions

The app includes a demo mode that lets you explore the user-facing functionality without being enrolled as an actual study participant. This section explains how to access it and how the available functions relate to real-world app usage. For screenshots and description of the demo visit the wiki page.

> **Note:** The demo mode is currently only available in English.

### How to access the demo mode

1. Start the app.
2. When prompted to enter a code, type `Demo`.
3. Select symptoms from the provided list, or add custom symptoms. This selection can be edited later at any time.
4. A button will appear for each function available in the app (see below).

### Available functions

After entering the demo mode, buttons for the following functions become available. In the real app, these buttons appear dynamically based on the participant's individual schedule and study progress—in the demo, all of them are shown together so you can try each one independently.

- **Start Tutorial**

  In the real app, this normally appears on the first day after installation. It walks new participants through the entire questionnaire including the cognitive tests so they become familiar with all question types before the study begins.

- **Start Test**

  In the real app, this appears when a test is scheduled for the participant. It includes questions on fatigue, subjective cognitive function, cognitive tests, questions on activities, other symptoms, mood, and fatigue again.

- **Missing**

  In the real app, this appears when a participant has missed a scheduled assessment. It asks the participant to indicate why the assessment was missed.

- **Sleep**

  In the real app, this appears on a new day. It asks about sleep duration and quality.

- **Weekly**

  In the real app, this appears at the end of each week. It asks about illness, working hours, and (where relevant) menstruation during the past week.

#### Additional functions

- **Tutorial chapters**

  In the real app, once a participant has completed the tutorial once, they can revisit the whole tutorial or just the cognitive tests.

- **Adapt Symptoms**

  This button is always visible, both in the demo and in the real app, allowing participants to update their symptom selection at any time.

---

## 📚 Citation & Publication

If you use **COVISION-PWA** in your research, please cite the software release:

- Weber M, Knak AK, Wulff A. _COVISION-PWA_ (Version 1.0.0) [Computer software]. Zenodo. 2025 Oct. doi: [10.5281/zenodo.21278265](https://doi.org/10.5281/zenodo.21278265).

For a detailed description of the application's design, methodology, implementation, and intended research use, please refer to the accompanying conference paper:

- Weber M, Knak AK, Wulff A. _A Mobile Research App for Post-COVID Fatigue Monitoring_. Stud Health Technol Inform. 2026 May 21;336:1614-1618. doi: [10.3233/SHTI260498](https://doi.org/10.3233/SHTI260498). PMID: 42175169.

---

## 📄 License

MIT License – see [LICENSE](LICENSE)

---

## 📬 Contact

For questions or collaboration:  
[Marcel Weber] <marcel.weber@uol.de>  
[Big Data in Medicine] – Carl von Ossietzky Universität Oldenburg, Germany

---

> ✅ **This project is open-source and ready for research use.**  
> Use it to build your own longitudinal symptom monitoring study!

---

## 🤝 Acknowledgements and Funding

As part of the **COVISION** project, this work is supported by the **COVID-19-Research Network Lower Saxony (COFONI)** through funding from the **Ministry of Science and Culture of Lower Saxony in Germany** (14-76403-184). We thank our fellow researchers from the COVISION consortium (M. Dirks, A.-K. Hennemann, A. Hildebrandt, N. Gröpler, J. Voelter, K. Weissenborn, M. Roheger, G. Zoch) for their expertise and advice.
