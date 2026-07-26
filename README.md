# SnapLab — Premium PhotoBooth Kiosk

A professional-grade, fullscreen photo booth web application built with **Next.js 14**, **Tailwind CSS**, **Konva.js**, and **Cloudinary**. Designed for events, parties, weddings, and corporate functions.

## ✨ Features

- **4 Layout Templates**: Classic Strip, 2×2 Grid, Single Shot, Polaroid
- **Live Camera**: Real-time webcam preview with 3-2-1 countdown and flash
- **Custom Frames**: Choose from Classic, Vintage, or Neon frame overlays
- **Cloudinary Upload**: Direct browser upload — no backend needed
- **QR Code Sharing**: Scan to download your photo instantly
- **Auto-Reset**: Returns to idle after 30 seconds of inactivity
- **Kiosk-Ready**: Fullscreen, touch-optimized, keyboard shortcuts
- **Premium UI**: Glass morphism, smooth animations, dark theme

## 🖥️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | React framework |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Page transitions & animations |
| Konva.js + react-konva | Canvas photo compositing |
| react-webcam | Webcam access |
| qrcode | QR code generation |
| Cloudinary (unsigned) | Image hosting & CDN |

## 📁 Project Structure

```
src/
├── app/
│   ├── page.jsx              ← Main kiosk app (screen state manager)
│   ├── layout.jsx            ← Root layout with Poppins font
│   └── globals.css           ← Design system & component classes
├── components/
│   ├── IdleScreen.jsx        ← "Tap to Start" splash screen
│   ├── LayoutPicker.jsx      ← Layout template selection
│   ├── CameraScreen.jsx      ← Webcam + countdown + capture
│   ├── FramePicker.jsx       ← Konva canvas with frame overlays
│   ├── ProcessingScreen.jsx  ← Upload with animated progress
│   └── QRScreen.jsx          ← QR code + photo preview + auto-reset
├── utils/
│   ├── cloudinary.js         ← Cloudinary unsigned upload
│   ├── composeCanvas.js      ← Canvas layout math & utilities
│   └── generateQR.js         ← QR code generation wrapper
└── config.js                 ← Booth settings & Cloudinary config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Cloudinary](https://cloudinary.com) account (free tier)
- A webcam

### 1. Install

```bash
npm install
```

### 2. Set Up Cloudinary

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. From your Cloudinary dashboard, copy your **Cloud Name**
3. Go to **Settings > Upload > Upload presets**
4. Click **Add upload preset**
5. Set **Signing Mode** to **Unsigned**
6. Set **Access Control** to **Public**
7. Save and copy the **Upload preset name**

### 3. Configure

Open `src/config.js` and update:

```js
export const CONFIG = {
  boothName: "Your Booth Name",     // Shown on idle screen
  boothTagline: "Your Tagline",
  cloudinaryCloudName: "YOUR_CLOUD_NAME",     // From Cloudinary dashboard
  cloudinaryUploadPreset: "YOUR_UPLOAD_PRESET", // Unsigned upload preset
  accentColor: "#ec4899",            // Your brand color
  // ... other options
};
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in Chrome and press **F11** for fullscreen kiosk mode.

## 🎮 Usage

1. **Idle Screen**: Tap "Start" or press Enter/Space
2. **Choose Layout**: Pick from 4 template options
3. **Capture Photos**: Countdown, smile, flash!
4. **Customize**: Choose frame style, toggle date
5. **Processing**: Photo uploads to Cloudinary
6. **Share**: Scan QR code to download, or copy URL

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Enter` / `Space` | Start (on idle screen) |
| `Escape` × 3 | Emergency reset to idle |
| `← Back` buttons | Navigate backwards |

## 🛠️ Configuration Options

All settings in `src/config.js`:

| Option | Type | Default | Description |
|---|---|---|---|
| `boothName` | string | `"SnapLab"` | Booth name on idle screen |
| `boothTagline` | string | `"Capture the Moment"` | Tagline below name |
| `accentColor` | hex | `"#ec4899"` | Primary brand color |
| `autoResetSeconds` | number | `30` | Auto-return timeout |
| `countdownSeconds` | number | `3` | Countdown duration |
| `showDateOnPhoto` | boolean | `true` | Toggle date stamp |
| `enableSoundEffects` | boolean | `true` | Camera shutter sound |

## 🔧 Custom Frames

Add your own frame PNGs to the `public/frames/` directory. Frame styles are configurable in the FramePicker component (inline SVG overlays used by default).

## 🌐 Browser Support

Optimized for **Google Chrome** (kiosk mode). Works in modern Chromium-based browsers.

## 📝 License

MIT — free for personal and commercial use.
