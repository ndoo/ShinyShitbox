/**
 * strings.js — Centralised UI strings and icon templates.
 *
 * Icons are rendered via Strings.icon(name, cls) which returns an SVG HTML
 * string.  Use it in Alpine expressions with x-html, e.g.:
 *
 *   <button x-html="Strings.icon('wrench', 'w-4 h-4')"></button>
 *   <span   x-html="Strings.icon('list',   'w-4 h-4')"></span>
 *
 * Labels are plain strings for button text / aria labels, e.g.:
 *
 *   <button x-text="Strings.label.save"></button>
 */
window.Strings = (() => {
  // Inner SVG content (path elements) keyed by icon name.
  // The wrapping <svg> is added by icon() so the class stays DRY.
  const _inner = {
    wrench:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>',
    pencil:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>',
    trash:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>',
    plus:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>',
    list:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>',
    settings:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>',
  };

  return {
    /**
     * Returns an SVG HTML string for the named icon.
     * @param {string} name  - icon key (wrench | pencil | trash | plus | list | settings)
     * @param {string} [cls] - Tailwind size classes, default "w-4 h-4"
     */
    icon(name, cls = 'w-4 h-4') {
      const inner = _inner[name];
      if (!inner) { console.warn(`Strings.icon: unknown icon "${name}"`); return ''; }
      return `<svg xmlns="http://www.w3.org/2000/svg" class="${cls}" fill="none" `
           + `viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">${inner}</svg>`;
    },

    get label() {
      const t = window.I18n ? k => I18n.t(k) : k => k;
      return {
        service:  t('action.logService'),
        edit:     t('action.edit'),
        delete:   t('action.delete'),
        save:     t('action.save'),
        cancel:   t('action.cancel'),
        add:      t('action.add'),
        manage:   t('action.manage'),
        hideList: t('action.hideList'),
      };
    },
  };
})();
