# Vedic Web

A modern Angular application with Bootstrap styling, containerized with Docker.

## Features

- Angular 17 with standalone components
- Bootstrap 5.3.2 for responsive design
- Docker support for easy deployment
- Development server with hot reload

## Quick Start

### Using Docker Compose (Recommended)

1. Make sure Docker and Docker Compose are installed
2. Navigate to the project directory:
   ```bash
   cd vedic-web
   ```
3. Run the application:
   ```bash
   docker compose up
   ```
4. Open your browser and navigate to `http://localhost:4200`

### Manual Setup

1. Install Node.js 18 or higher
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Development

- The application will automatically reload when you make changes
- Source files are in the `src/` directory
- Bootstrap is already configured and ready to use

## Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Docker Commands

- Build the Docker image: `docker build -t vedic-web .`
- Run the container: `docker run -p 4200:4200 vedic-web`
- Stop the container: `docker compose down`
