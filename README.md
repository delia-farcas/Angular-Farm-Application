# Angular-Farm-Application

MyFarm is an Angular web app for managing farm animals and tracking simple farm activity in one place.

## Work In Progress

This project is still in active development. Some pages are already functional, some are partially implemented, and a few areas are still placeholders or being refined.

## What The Project Does Right Now

- Shows a landing flow with welcome, login, and signup screens
- Lets you enter the main dashboard
- Displays a list of animals
- Supports adding, editing, filtering, and deleting animals
- Includes a management view for daily farm inputs such as milk, eggs, wool, and work hours
- Generates monthly and yearly reports based on logged farm data
- Includes chart-based report views using `Chart.js`
- Contains an early "genetic predictor" section that is present in navigation but still under development

## Current Structure

The app is currently split into a few main areas:

- `StartingPage` for the entry flow
- `AppPage` for the main dashboard
- `ListPage` for animal listing and filtering
- `AddAnimal` for creating and editing animal records
- `ManagePage` for daily production/log input
- `RaportsPage` with monthly and yearly reporting views

## Tech Stack

- Angular 21
- TypeScript
- Angular Forms
- Chart.js
- ng2-charts
- Playwright

## Getting Started

### Prerequisites

- Node.js
- npm

### Install dependencies

```bash
npm install
```

### Run the project locally

```bash
npm start
```


## Available Scripts

```bash
npm start
```

Starts the Angular development server.

```bash
npm run build
```

Builds the project for production.

```bash
npm test
```

Runs the test setup configured for the project.

## Notes About The Current State

- Data is currently managed in local in-memory services
- Some labels and UI text are in Romanian
- There are placeholder/example test files that still need to be replaced with project-specific coverage
- Features and structure may continue to change while the project is being built

## Roadmap Ideas

- Persistent storage or backend integration
- Authentication flow connected to real user accounts
- Better farm analytics and richer report filtering
- A completed genetic predictor workflow
- Improved automated test coverage

## Status

This repository reflects an in-progress student/personal project and is not yet finished.
