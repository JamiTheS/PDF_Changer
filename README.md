# 🔷 PDF Editor Pro

A powerful, privacy-first browser extension for editing, annotating, signing, and merging PDF documents — entirely offline.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- **📝 Text Editing** — Click to edit existing text in PDFs with font/size control
- **🖊️ Annotations** — Draw freehand, add shapes (rectangles, circles, arrows, lines)
- **🎨 Markup** — Highlight, underline, and strikethrough text
- **✍️ Signatures** — Draw or upload signature images
- **🖼️ Images** — Insert images into any page
- **📄 Merge PDFs** — Combine multiple PDF files into one
- **🔄 Page Management** — Rotate pages, navigate via thumbnails
- **↩️ Undo/Redo** — Full history support
- **🗑️ Delete** — Remove any annotation with one click or keyboard

## 🔒 Privacy

- **100% offline** — All processing happens in your browser
- **No server uploads** — Your documents never leave your device
- **No tracking** — Zero analytics or telemetry
- **Minimal permissions** — PDF access is initiated by the user through the extension action

## 🚀 Installation

### From source

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/PDF_Changer.git
cd PDF_Changer

# Install dependencies
pnpm install

# Build the extension
pnpm run build

# Load in Chrome
# 1. Go to chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the `dist/` folder
```

## Chrome Web Store package

```bash
# Build, validate, and create pdf-editor-pro-cws.zip
npm run package:cws
```

The store package intentionally uses only the `activeTab` permission and does not ship broad host permissions or static content scripts. The validation step also checks for valid PNG icons, source maps, broad URL permissions, and common dynamic-code patterns before creating the zip.

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** | UI components |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **Fabric.js** | Canvas annotations |
| **PDF.js** | PDF rendering |
| **pdf-lib** | PDF manipulation |
| **Zustand** | State management |
| **Tailwind CSS** | Styling |

## 📁 Project Structure

```
src/
├── background/       # Service worker (PDF detection)
├── content/          # Content script (PDF banner)
├── editor/           # Main editor application
│   ├── components/   # React components
│   │   ├── Canvas/   # PDF viewer & annotation canvas
│   │   ├── Modals/   # Merge & split modals
│   │   ├── Sidebar/  # Page thumbnails & properties
│   │   ├── Signature/ # Signature pad
│   │   └── Toolbar/  # Tool buttons & groups
│   ├── hooks/        # React hooks
│   ├── stores/       # Zustand state stores
│   └── utils/        # PDF helpers & canvas utilities
├── popup/            # Extension popup
└── shared/           # Types, constants, i18n
```

## 📜 License

MIT — feel free to use, modify, and distribute.
