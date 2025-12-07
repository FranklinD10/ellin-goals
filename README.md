# Ellin Goals

A habit tracking application built with React and Firebase.

## Features

- Track daily habits and goals
- View progress analytics
- Firebase authentication
- Real-time data synchronization

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase configuration:
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Start the development server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run clearFirestore` - Clear Firestore collections (development only)

## Technologies

- React 18.x (^18.2.0)
- Firebase (Authentication, Firestore)
- TypeScript
- Vite
- Material-UI

## Security

This project has been assessed for CVE-2025-55182 (React2shell RCE vulnerability) and is **NOT VULNERABLE**. See [SECURITY_ASSESSMENT_CVE-2025-55182.md](./SECURITY_ASSESSMENT_CVE-2025-55182.md) for details.

The project uses React 18.x, which does not include the vulnerable React Server Components feature. For security recommendations and future upgrade guidance, please refer to the security assessment document.
