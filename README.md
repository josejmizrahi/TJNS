# TJNS (Jewish Network State)

A digital sovereign community platform built on XRPL blockchain technology.

## Overview

TJNS is a platform that connects the Jewish diaspora globally through a digital sovereign community. It provides tools for identity verification, governance, and economic interaction within the community.

## Features

- JewishID: Digital identity system for community members
- Token System: ShekelCoin (SHK) and MitzvahPoints (MVP)
- XRPL Integration: Leveraging blockchain for transparency and security

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- TypeScript

## Installation

1. Clone the repository:
```bash
git clone https://github.com/josejmizrahi/TJNS.git
cd TJNS
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory (use .env.example as template)

4. Build the project:
```bash
npm run build
```

## Development

Start the development server:
```bash
npm run dev
```

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build the project
- `npm start`: Start production server
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## Project Structure

```
src/
├── config/         # Configuration files
├── services/       # Business logic
│   ├── identity/   # Identity service
│   └── token/      # Token service
├── routes/         # API routes
├── models/         # Data models
└── utils/          # Utility functions
```

## License

ISC
