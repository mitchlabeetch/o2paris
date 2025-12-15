# Jules.md - Development Guide

## Overview
This document serves as a guide for the ongoing development and maintenance of the O2Paris application. It tracks the implementation plan, audits, and future improvements.

## Implementation Plan

### 1. Documentation and Codebase Audit
- [x] Audit `package.json` and dependencies.
- [x] Audit `next.config.js`.
- [x] Audit `tailwind.config.ts`.
- [x] Review existing documentation.
- [x] Analyze codebase structure.

### 2. UI/UX Updates (Paris & Water Theme)
1.  [x] Update color palette to match "Eau de Paris" branding.
2.  [x] Change font to a more elegant/Parisian font (Lato/Playfair).
3.  [x] Add water-themed background patterns.
4.  [x] Customise marker icons to be more distinct.
5.  [x] Improve popup design.
6.  [ ] Update Admin Panel UI to match the public theme.
7.  [ ] Add a "About" modal or section with project context.
8.  [x] Improve loading states with water-related animations.
9.  [x] Enhance responsive design for mobile users.
10. [ ] Add a favicon and app manifest for better branding.

### 3. Functionality Improvements
1.  [x] Implement proper error handling for map loading (Basic).
2.  [x] Add search functionality for pinpoints.
3.  [x] Add filtering by category (via search text).
4.  [x] Improve audio player controls (Visualizer added).
5.  [x] Add "Locate Me" button to the map.
6.  [ ] Implement image gallery support for pinpoints.
7.  [ ] Optimize image loading.
8.  [x] Add confirmation dialogs for Admin actions (Already in code `confirm()`, but could be better).
9.  [ ] Implement basic analytics or logging.
10. [ ] Add "Share" functionality for specific pinpoints.

### 4. Bug Fixes
1.  [x] **CRITICAL**: Fix Vercel build failure.
2.  [x] **CRITICAL**: Fix Admin Panel password issue.
3.  [x] Fix any console warnings/errors.
4.  [x] Ensure map markers render correctly on all devices.
5.  [x] Fix any layout shifts during loading.

## Status Update
- UI/UX: Admin Panel needs styling love.
- Features: Share, About Modal, and potentially Images are next.
