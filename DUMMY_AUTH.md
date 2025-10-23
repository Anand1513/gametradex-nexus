# Dummy Auth Mode for GameTradeX

This document explains how to use the dummy authentication mode for development and testing purposes.

## Environment Variables

To enable dummy auth mode, set the following environment variables:

```
VITE_REACT_APP_USE_DUMMY_AUTH=true
```

To switch back to Firebase authentication, set:

```
VITE_REACT_APP_USE_DUMMY_AUTH=false
VITE_REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
```

## Dummy Credentials

When dummy auth mode is enabled, you can use the following credentials to log in:

- **Admin User**:
  - Email: `admin@example.com`
  - Password: `admin123`

## How It Works

1. When `VITE_REACT_APP_USE_DUMMY_AUTH` is set to `true`, the application will bypass Firebase authentication.
2. The login page will display the dummy credentials when in dummy auth mode.
3. Authentication tokens are stored in localStorage with a 2-hour expiration.
4. Protected routes will work with both real Firebase auth and dummy auth.

## Switching to Real Firebase Authentication

To switch to real Firebase authentication:

1. Set `VITE_REACT_APP_USE_DUMMY_AUTH` to `false`
2. Set `VITE_REACT_APP_FIREBASE_API_KEY` to your actual Firebase API key
3. Ensure your Firebase project is properly configured with authentication enabled
4. Update the Firebase configuration in `src/lib/firebase.ts` if needed

## Security Considerations

- Dummy auth mode should ONLY be used for development and testing
- Never deploy to production with dummy auth mode enabled
- The dummy credentials are hardcoded and not secure
- In production, always use proper Firebase authentication

## Implementation Details

The dummy auth implementation includes:

1. Conditional Firebase initialization based on environment variables
2. A dummy database with predefined users
3. Token-based authentication with localStorage
4. Expiration handling for security
5. UI indicators when in dummy auth mode