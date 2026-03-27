# Ledra Design System

## Overview

LedraのHP（マーケティング）とアプリ（ダッシュボード）を「同じブランドの別モード」として統一するデザインシステム。

- **HP**: ダークテーマ・演出的・CV重視
- **アプリ**: ライトテーマ・機能的・業務効率重視
- **共通**: カラー・角丸・スペーシング・フォント・ボーダー・状態設計

---

## Design Tokens

トークンは `src/app/globals.css` の `:root` で定義。マーケティングは `[data-theme="dark"]` で上書き。

### Color

| Token | Light | Dark |
|-------|-------|------|
| `--bg-base` | `#f5f5f7` | `#060a12` |
| `--bg-surface-solid` | `#ffffff` | `#0d1525` |
| `--text-primary` | `#1d1d1f` | `#ffffff` |
| `--text-secondary` | `#6e6e73` | `rgba(255,255,255,0.5)` |
| `--accent-blue` | `#0071e3` | (same) |

### Font

| Token | Value |
|-------|-------|
| `--font-sans` | Noto Sans JP + fallbacks |
| `--font-serif` | Yu Mincho + fallbacks |
| `--font-mono` | Geist Mono |

### Radius

`--radius-sm` (8px) / `--radius-md` (12px) / `--radius-lg` (16px) / `--radius-xl` (20px) / `--radius-full`

### Shadow

`--shadow-sm` / `--shadow-md` / `--shadow-lg` / `--shadow-xl` / `--shadow-focus`

---

## Components (`src/components/ui/`)

| Component | File | Purpose |
|-----------|------|---------|
| `Button` | `Button.tsx` | Variants: primary/secondary/ghost/danger/outline. Sizes: sm/md/lg |
| `Badge` | `Badge.tsx` | Status pills. Variants: default/success/warning/danger/info/violet |
| `Card` | `Card.tsx` | Surface container. Variants: default(glass)/elevated/inset |
| `Input` | `Input.tsx` | Text input with error state |
| `Select` | `Select.tsx` | Select dropdown with error state |
| `Textarea` | `Textarea.tsx` | Multi-line input |
| `FormField` | `FormField.tsx` | Label + input + hint + error wrapper |
| `SectionTag` | `SectionTag.tsx` | Uppercase monospace section label |
| `StatCard` | `StatCard.tsx` | Dashboard metric card |
| `EmptyState` | `EmptyState.tsx` | No-data placeholder |
| `Skeleton` | `Skeleton.tsx` | Loading placeholder |
| `Modal` | `Modal.tsx` | Dialog overlay |
| `Drawer` | `Drawer.tsx` | Slide-in panel |
| `Toast` | `Toast.tsx` | Notification system (with `ToastProvider`, `useToast`) |
| `ConfirmDialog` | `ConfirmDialog.tsx` | Destructive action confirmation |
| `DataTable` | `DataTable.tsx` | Structured table with selection/sorting |
| `Accordion` | `Accordion.tsx` | Expandable sections |
| `PageHeader` | `PageHeader.tsx` | Page title area |
| `Pagination` | `Pagination.tsx` | Page navigation |
| `Sidebar` | `Sidebar.tsx` | App navigation |

### Status Maps (`src/lib/statusMaps.ts`)

Centralized status-to-badge-variant mappings:
- `CERTIFICATE_STATUS_MAP`
- `NFC_STATUS_MAP`
- `DOCUMENT_STATUS_MAP`
- `INVOICE_STATUS_MAP`
- `getStatusEntry(map, status)` — safe lookup

---

## CSS Classes (`globals.css`)

| Class | Use |
|-------|-----|
| `.glass-card` | App card with backdrop blur |
| `.dark-card` | Marketing dark card |
| `.btn-primary/secondary/ghost/danger/outline` | Button variants |
| `.input-field` | Form input |
| `.select-field` | Form select |
| `.section-tag` | Uppercase monospace label |
| `.skeleton` | Loading pulse |

### Button Size Modifiers

`data-size="sm"` / `data-size="lg"` on any `.btn-*` class.

---

## Absolute Rules

1. **Never** use `alert()`, `confirm()`, `prompt()` — use Modal/ConfirmDialog/Toast
2. **Never** hardcode hex colors — use tokens
3. **Never** create new badge/status components — extend Badge + statusMaps
4. **Never** use `font-sans` for IDs/codes — use `font-mono`
5. **Never** animate app elements on scroll — scroll animation is HP-only
6. **Never** use `!important` in Tailwind classes
7. **Always** provide empty state for lists/tables
8. **Always** provide loading skeleton matching real content shape
9. **Always** use `.section-tag` for uppercase labels in detail pages
10. **Always** use `FormField` wrapper for form inputs

---

## Design Review Checklist

- [ ] No hardcoded color values
- [ ] No `!important` overrides
- [ ] No inline `style={}` for design properties
- [ ] Empty state uses EmptyState component
- [ ] Loading state uses Skeleton
- [ ] Status badges use statusMaps
- [ ] Buttons use proper size variants
- [ ] Forms use FormField wrapper
- [ ] Destructive actions use ConfirmDialog
- [ ] Icons: Heroicons outline, 18x18, strokeWidth 1.5
- [ ] `font-mono` for IDs/codes/technical data
