// Lightweight i18n helper for the editor UI
// Uses chrome.i18n for extension strings, this module handles editor-specific strings

const messages: Record<string, Record<string, string>> = {
  en: {
    'tool.select': 'Select',
    'tool.editText': 'Edit Text',
    'tool.text': 'Add Text',
    'tool.highlight': 'Highlight',
    'tool.underline': 'Underline',
    'tool.strikethrough': 'Strikethrough',
    'tool.pen': 'Pen',
    'tool.rectangle': 'Rectangle',
    'tool.circle': 'Circle',
    'tool.arrow': 'Arrow',
    'tool.line': 'Line',
    'tool.signature': 'Signature',
    'tool.image': 'Image',
    'tool.eraser': 'Eraser',
    'action.undo': 'Undo',
    'action.redo': 'Redo',
    'action.save': 'Save PDF',
    'action.download': 'Download',
    'action.merge': 'Merge PDFs',
    'action.split': 'Split PDF',
    'action.rotate': 'Rotate',
    'view.singlePage': 'Single Page',
    'view.doublePage': 'Double Page',
    'view.continuous': 'Continuous',
    'sidebar.pages': 'Pages',
    'sidebar.properties': 'Properties',
    'sidebar.layers': 'Layers',
    'page': 'Page',
    'of': 'of',
  },
  fr: {
    'tool.select': 'Sélection',
    'tool.editText': 'Modifier texte',
    'tool.text': 'Ajouter du texte',
    'tool.highlight': 'Surligner',
    'tool.underline': 'Souligner',
    'tool.strikethrough': 'Barrer',
    'tool.pen': 'Stylo',
    'tool.rectangle': 'Rectangle',
    'tool.circle': 'Cercle',
    'tool.arrow': 'Flèche',
    'tool.line': 'Ligne',
    'tool.signature': 'Signature',
    'tool.image': 'Image',
    'tool.eraser': 'Gomme',
    'action.undo': 'Annuler',
    'action.redo': 'Rétablir',
    'action.save': 'Sauvegarder',
    'action.download': 'Télécharger',
    'action.merge': 'Fusionner',
    'action.split': 'Séparer',
    'action.rotate': 'Rotation',
    'view.singlePage': 'Page simple',
    'view.doublePage': 'Double page',
    'view.continuous': 'Continu',
    'sidebar.pages': 'Pages',
    'sidebar.properties': 'Propriétés',
    'sidebar.layers': 'Calques',
    'page': 'Page',
    'of': 'sur',
  },
};

let currentLocale = 'en';

export function setLocale(locale: string): void {
  if (messages[locale]) {
    currentLocale = locale;
  }
}

export function t(key: string): string {
  return messages[currentLocale]?.[key] ?? messages['en']?.[key] ?? key;
}

export function getLocale(): string {
  return currentLocale;
}

export function detectLocale(): string {
  try {
    const uiLang = chrome.i18n.getUILanguage();
    return uiLang.startsWith('fr') ? 'fr' : 'en';
  } catch {
    return navigator.language.startsWith('fr') ? 'fr' : 'en';
  }
}
