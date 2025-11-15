# Anvisul (Data Science Frontend of Skill Based Mini Project)

## Getting Started

First, install the dependencies:
```bash
npm install
# or
npm i
```
Then run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Frontend Overview

The frontend is the user-facing layer responsible for receiving the CSV file, validating it, and rendering the extracted data in an interactive table format. It handles all client-side logic, including file upload, parsing, error feedback, and displaying results in a structured layout.

## Technology Stack

- **Next.js** for component-based UI and routing  
- **React Hooks** for state management  
- **Axios / Fetch API** for communication with the Flask backend  
- **TailwindCSS** for consistent and responsive styling  
- **CSV Parsing Utility** (e.g., Papaparse) when light client-side parsing is needed


## Deployed on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the project [Live Link](https://anvisul.vercel.app/)
