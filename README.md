# ⬛ **Note --**

A precision-engineered note-taking mobile application built with **React Native (Expo)** and **Supabase**, designed to provide a distraction-free workspace with a minimalist industrial dark theme.

---

## 👥 **Group Members**

### **Leader**

- **Mark Anthony Parungao**

### **Members**

- **Christian Laurence Quilatquilat**
- **Cyrus Caluyong**
- **Kirk Joshua Komatsuzaki**
- **Josh Jumawan**

---

## 📱 **Project Description**

**Note --** (Note Dash) is a full-stack mobile app crafted for professional, organized, and media-rich note-keeping.  
Built with **React Native**, powered by **Supabase**, and styled using **NativeWind**, the app abandons colorful distractions for a strict **Slate & Zinc** aesthetic, emphasizing focus and clarity.

---

## ✨ **Core Features**

- 🔐 **User Authentication** — Secure login and signup powered by Supabase Auth
- 📝 **Media-Enhanced Notes** — Add text, images, and video loops
- ☁️ **Cloud Storage** — Files stored and served via Supabase Storage
- 📂 **Full CRUD** — Create, Read, Update, Delete notes
- 🌑 **Industrial UI/UX** — Dark mode interface, sharp typography, and high-contrast layout

---

## 🛠️ **Tech Stack**

| Category      | Technology                                 |
| ------------- | ------------------------------------------ |
| **Framework** | React Native (Expo SDK 54)                 |
| **Language**  | TypeScript                                 |
| **Styling**   | NativeWind (Tailwind CSS)                  |
| **Backend**   | Supabase (Auth, Database, Storage)         |
| **Media**     | Expo Image Picker, Expo Video, File System |

---

## 🚀 **Installation & Setup**

Follow these steps to run the project locally.

---

### **1. Prerequisites**

Ensure you have:

- Node.js (LTS)
- Git
- Expo Go (Android/iOS)

---

### **2. Clone the Repository & Install Dependencies**

```bash
git clone <repository-url>
cd Note--
npm install
```

---

### **3. Configure Environment Variables**

Create an `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

### **4. Run the Project**

```bash
npx expo start
```

Scan the QR code using **Expo Go** to launch the app.

---

## 📦 **Build Command (EAS)**

```bash
eas build --platform android
```

---
