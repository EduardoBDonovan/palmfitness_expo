# Palm Fitness - Expo Migration

This is the Expo (React Native) version of the Palm Fitness iOS application, migrated from the original Swift codebase.

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: Ensure you have Node.js installed.
- **Expo Go**: Download the Expo Go app on your [iOS](https://apps.apple.com/app/expo-go/id982107779) or [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) device to test on hardware.

### 2. Installation
Navigate to the project directory and install dependencies:
```bash
cd palmfitness_expo
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `palmfitness_expo` root (use the existing `.env.example` as a template):
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Running the App
Start the development server:
```bash
npx expo start
```
- **Scan the QR code** with your phone's camera (iOS) or Expo Go app (Android) to open the app.
- Press **`i`** to open in the iOS Simulator (Mac only).
- Press **`a`** to open in the Android Emulator.
- Press **`w`** to open in the Web browser.

---

## 🛠 Features Implemented

- **Authentication**: Fully functional Sign-In and 3-step Sign-Up flow mirrored from the iOS app.
- **Main Feed**: Dynamic social feed with type-specific gradients (Workout, Meal, Lifestyle).
- **Post Details**: Full-screen post view with interactive comments and "force expand" logic.
- **Messaging**: Real-time DMs using Supabase Realtime, conversation lists, and user search.
- **Profile**: Personal stats, tabbed content (Posts, Physio, etc.), and external profile views.
- **Post Composer**: Complex forms for creating Workouts (with sets/exercises) and Meals (with macros/ingredients).
- **Media**: Image picking and Supabase Storage integration for posts and profile pictures.
- **Account & Presets**: Account menu with full CRUD functionality for Workout and Exercise presets.

## 📁 Project Structure
- `app/`: Expo Router file-based navigation (Tabs, Auth, Modals).
- `src/components/`: Reusable UI components (PostCard, Profile components, Composer forms).
- `src/services/`: Supabase logic (Auth, Posts, Messages, Storage, Presets).
- `src/context/`: React Context providers (AuthContext).
- `src/types/`: TypeScript interfaces for database models.
- `src/constants/`: App theme, colors, and global constants.

---

## 🏗 Tech Stack
- **Framework**: Expo / React Native
- **Language**: TypeScript
- **Navigation**: Expo Router (v3)
- **Backend**: Supabase (Database, Auth, Storage, Realtime)
- **State/Data**: TanStack Query (React Query)
- **Styling**: React Native StyleSheet + Expo Linear Gradient
- **Icons**: Lucide React Native
