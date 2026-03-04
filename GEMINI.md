# Palm Fitness - Expo Migration

This project is an Expo-based (React Native) migration of the Palm Fitness iOS application. It is a fitness-oriented social platform that allows users to share workouts, meals, and lifestyle updates.

## 🚀 Project Overview

- **Purpose:** A social fitness platform for tracking and sharing workouts, meals, and lifestyle content.
- **Architecture:** Expo Router (v3) for file-based navigation, React Native for the UI, and Supabase for the backend.
- **Core Technologies:**
  - **Framework:** [Expo](https://expo.dev/) / [React Native](https://reactnative.dev/)
  - **Language:** TypeScript
  - **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/)
  - **Backend:** [Supabase](https://supabase.com/) (Auth, Database, Storage, Realtime)
  - **State/Data:** [TanStack Query](https://tanstack.com/query/latest) (React Query)
  - **Styling:** React Native StyleSheet + [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)
  - **Icons:** [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native)

## 📁 Project Structure

- `app/`: Expo Router file-based navigation.
  - `(auth)/`: Authentication flow (login, register).
  - `(tabs)/`: Main application tabs (Feed, Messages, Post, Profile).
  - `account/`, `chat/`, `messages/`, `post/`, `profile/`: Screen-specific routes.
- `src/`: Core source code.
  - `components/`: Reusable UI components (PostCard, Profile components, Composer forms).
  - `services/`: Business logic and Supabase integration (Auth, Posts, Messages, Storage, Presets).
  - `context/`: React Context providers (e.g., `AuthContext`).
  - `types/`: TypeScript interfaces and type definitions.
  - `constants/`: App theme, colors, and global constants.
  - `lib/`: Library configurations (e.g., `supabase.ts`).
  - `hooks/`: Custom React hooks (e.g., `usePostComposer`).

## 🛠 Building and Running

### Prerequisites
- Node.js (v18+ recommended)
- Expo Go app on iOS/Android or a simulator/emulator.

### Commands
- **Install Dependencies:** `npm install`
- **Start Development Server:** `npx expo start`
- **Run on Android:** `npx expo start --android`
- **Run on iOS:** `npx expo start --ios`
- **Run on Web:** `npx expo start --web`

### Validation
To ensure project health and type safety, especially after making changes, run:
- **Expo Health Check:** `npx expo doctor` (Verifies dependencies and configuration)
- **TypeScript Check:** `npx tsc --noEmit` (Performs static type checking)

### Environment Variables
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 Development Conventions

- **Continuous Validation:** ALWAYS run `npx expo doctor` and `npx tsc --noEmit` after modifying code to catch configuration issues or type regressions early.
- **Data Fetching:** Use **TanStack Query** (React Query) for all asynchronous data fetching and state management to ensure caching and synchronization.
- **Backend Communication:** All Supabase interactions should reside within `src/services/` to keep components clean.
- **Navigation:** Utilize **Expo Router's** file-based routing. Define new screens by adding files to the `app/` directory.
- **Type Safety:** Maintain strict TypeScript definitions in `src/types/index.ts`. Avoid using `any` for core data models.
- **Styling:** Use standard `StyleSheet.create` for styling. Prefer the application theme defined in `src/constants/theme.ts`.
- **Realtime:** For messaging or live updates, utilize **Supabase Realtime** subscriptions (see `src/services/messages.ts`).

## 🧪 Testing
- **TODO:** Implement unit and integration tests (e.g., using Jest and React Native Testing Library).
