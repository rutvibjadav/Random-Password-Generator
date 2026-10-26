# Random Password Generator

A polished, responsive password generator created for **Task 17** of the Veda Technology Web Development Internship. Generate customizable passwords directly in your browser with the Web Crypto API.

## Features

- Choose a password length from 4 to 50 characters using a slider or number input.
- Select uppercase letters, lowercase letters, numbers, and symbols independently.
- Includes at least one character from every selected character type.
- Generates and shuffles characters with `crypto.getRandomValues()`.
- Show or hide, copy, regenerate, or clear the generated password.
- Displays character count and a simple Weak / Medium / Strong strength estimate.
- Validates the password length and prevents generation when no character types are selected.
- Responsive layout, keyboard-accessible controls, visible focus states, and live status messages.
- No framework or runtime dependency.

The strength indicator is a simple estimate based on length and character variety, not a guarantee of security.

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Web Crypto API and Clipboard API

## Project structure

```text
random-password-generator/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Run locally

1. Download or clone this project.
2. Open `index.html` in a modern browser.
3. For the best browser API compatibility, serve the folder from a local development server (for example, the VS Code Live Server extension) and open its local URL.

Password generation uses the browser's secure random source. Clipboard access may require a secure context, such as HTTPS or localhost.

## Deploy with GitHub Pages

1. Push the project files to the root of a GitHub repository.
2. Open the repository's **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the branch to publish and the `/ (root)` folder, then save.
5. Wait for the deployment to finish; GitHub Pages will show the published website URL in the Pages settings.

