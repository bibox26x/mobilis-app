# 📱 Mobilis App

> A modern, modular React Native app for managing Mobilis points of sale (PDV) tasks and planning.

[![React Native](https://img.shields.io/badge/React_Native-0.79-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)

---

## ✨ Features

- 🔐 Secure JWT authentication with persistent login
- 📋 Task management and planning for PDV locations
- 🗂️ Modern file-based navigation using **Expo Router**
- 🚀 Modular, type-safe codebase with strict TypeScript
- 🎨 Custom tab bar and theme support (dark/light)
- 📱 Responsive, smooth UI/UX with animations and error handling

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the app (Expo Go)
npx expo start
```

---

## 🛠️ Tech Stack

- **Frontend:** React Native + Expo
- **Navigation:** Expo Router (file-based)
- **State:** React Hooks
- **Storage:** AsyncStorage
- **Styling:** StyleSheet, theme context
- **API:** REST (JWT-protected)

---

## 📁 Project Structure

```
app/
  _layout.tsx           # Root stack navigation (Expo Router)
  index.tsx             # Login screen
  home/
    _layout.tsx         # Tabs navigation
    mainpage.tsx        # Main tasks page
    settings.tsx        # User settings
  taskdetails.tsx       # Modal task details
  +not-found.tsx        # 404 fallback
utils/
  components/           # Reusable UI components (Header, CustomTabBar, etc.)
  context/              # Theme context provider
  utils/                # API client and helpers
```

---

## 📝 API Integration

- Protected REST API endpoints with JWT authentication.
---

## 🧑‍💻 Development

```bash
# Run on Android
npm run android

# Run on iOS
npm run ios
```


---

## 📖 Notes

- This app is for Mobilis internal use only and requires valid authentication credentials.
- Built with Expo Router for scalable, maintainable navigation and modular code organization.

---

