# Design

## Theme
Restrained product UI. The working scene is a quiet operations desk in daylight: clear surfaces, cobalt current states, and compact controls.

## Colors
- `--bg`: `oklch(1.000 0.000 0)`
- `--surface`: `oklch(0.975 0.004 250)`
- `--surface-strong`: `oklch(0.940 0.010 250)`
- `--ink`: `oklch(0.180 0.020 250)`
- `--muted`: `oklch(0.420 0.020 250)`
- `--primary`: `oklch(0.450 0.123 250)`
- `--primary-hover`: `oklch(0.390 0.130 250)`
- `--accent`: `oklch(0.610 0.155 32)`
- `--success`: `oklch(0.510 0.120 150)`
- `--error`: `oklch(0.560 0.180 28)`

## Typography
System sans stack for all interface text. Product scale stays compact: 12, 14, 16, 20, 24, and 32px.

## Components
Material UI provides inputs, buttons, alerts, app bar, tabs, papers, and layout primitives. Form controls use explicit helper text for empty values, invalid formats, and API-side authentication states.

## Layout
Authentication screens use a two-column desktop layout that collapses to one column on mobile. Authenticated pages use a top navigation bar with stable tabs: Dashboard, Company, Order, User.

## Motion
Use short state transitions only. Disable nonessential transitions for reduced-motion users.
