# ⬛ **INK.**

> _Precision-Engineered Note-Taking._

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/) [![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.com/) [![NativeWind](https://img.shields.io/badge/NativeWind-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://www.nativewind.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 🏗️ **Project Overview**

**INK.** is a full-stack mobile application crafted for professional, media-rich data organization.

Diverging from the colorful clutter of standard productivity apps, **INK.** adopts a strict **Industrial Dark Theme**. Built on the **Slate & Zinc** palettes of NativeWind, it provides a high-contrast, distraction-free environment designed for focus. It seamlessly integrates text, imagery, and video loops into a cohesive workspace.

### **Design Philosophy**

- **Minimalist:** No unnecessary borders or gradients.
- **Industrial:** Dark mode by default, utilizing heavy grays and sharp typography.
- **Fast:** Immediate load times and real-time data synchronization.

---

## 👥 **Engineering Team**

| Member                      | Role               |
| :-------------------------- | :----------------- |
| **Jose Lesandro B. Torres** | Software Developer |
| **Stephen Kurt A. Mapili**  | Software Developer |

---

## ✨ **Core Architecture & Features**

### 🔐 **Authentication & Security**

- **Supabase Auth:** Robust email/password login flows.
- **Session Management:** Persisted user sessions with secure token handling.

### 📝 **Media-Rich Workspace**

- **Hybrid Content:** Seamlessly interleave text, high-res images, and video loops in a single note.
- **Media Picker:** Integrated `expo-image-picker` for intuitive asset selection.
- **Cloud Persistence:** All media assets are optimized and served via **Supabase Storage**.

### ⚙️ **The "Zinc" Interface**

- **NativeWind Styling:** Utility-first CSS tailored for mobile.
- **Dark Mode:** A dedicated UI/UX optimized for low-light environments and battery efficiency.

---

## 🛠️ **Tech Stack**

**Frontend**

- **Framework:** React Native (Expo SDK 54)
- **Language:** TypeScript
- **Routing:** Expo Router (File-based routing)

**Backend**

- **BaaS:** Supabase (PostgreSQL)
- **Storage:** Supabase Buckets (Image/Video hosting)

**Styling**

- **Engine:** NativeWind (Tailwind CSS)
- **Palette:** Slate / Zinc / Neutral

---

## 🚀 **Local Development Setup**

Follow these instructions to deploy the "Ink" workspace on your local machine.

### **1. Prerequisites**

Ensure your development environment is ready:

- [Node.js (LTS)](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/client) (installed on your physical device or emulator)

### **2. Cloning & Installation**

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project root
cd ink-mobile

# Install dependencies
npm install
```

### **3. Environment Configuration**

Create a `.env` file in the root directory. You must populate this with your Supabase credentials.

```env
EXPO_PUBLIC_SUPABASE_URL=your_unique_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **4. Execution**

Launch the metro bundler:

```bash
npx expo start
```

_Press `a` for Android Emulator, `i` for iOS Simulator, or scan the QR code with Expo Go._

---

## 📦 **Build & Distribution**

To generate a production-ready APK/AAB for Android:

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Build for Android
eas build --platform android
```

---

© 2025 INK. Project. All Rights Reserved.
