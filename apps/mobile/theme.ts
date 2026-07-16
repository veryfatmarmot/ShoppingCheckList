// Semantic color tokens for the app's dark theme.
//
// Every color in apps/mobile comes from here — screens and components must not
// hardcode hex values. Tokens are named for their ROLE, not their hue, so the
// palette can be retuned in this one file without touching a single screen.
//
// Palette: charcoal surfaces, a single mint accent for everything positive or
// interactive, and coral reserved strictly for destructive actions (delete). If
// coral shows up anywhere else, that's a bug — it's the color users read as
// "this removes something".
export const colors = {
  // Surfaces, from back to front.
  background: '#2b2b2b', // screen background
  surface: '#3a3a3a', // rows, cards, dialogs
  surfaceAlt: '#484848', // one-time list rows — a step up from surface
  surfaceRaised: '#4d4d4d', // chrome that sits above content: header, tab bar, snackbar
  surfaceSunken: '#242424', // text inputs — recessed relative to the dialog they sit in
  border: '#4d4d4d',
  borderAlt: '#5a5a5a', // one-time row border
  divider: '#484848', // separators inside a row
  backdrop: 'rgba(0, 0, 0, 0.6)', // behind modals

  // Accent — the single positive/primary accent.
  accent: '#7fd4a0',
  accentSurface: '#33463c', // tinted fill behind accent text (catalog "in list" control)
  onAccent: '#14261c', // text/glyphs on an accent-filled surface

  // Destructive — delete only.
  danger: '#f08080',
  onDanger: '#2b1414', // text on a danger-filled surface

  // Text, strongest to weakest.
  textPrimary: '#f2f0ed',
  textSecondary: '#c8c4bf', // dialog body copy
  textMuted: '#9a948c', // notes, secondary labels, inactive tabs
  textFaint: '#7a746c', // placeholders, drag handle
} as const;
