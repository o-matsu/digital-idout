# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Digital-idout is a Nuxt 3 web application for spatial data visualization and management with 3D capabilities. It uses Firebase as the backend (Firestore, Storage, Authentication) and Three.js for 3D rendering.

## Common Commands

```bash
# Development
yarn dev                  # Start dev server (localhost:3000)
yarn build               # Build for production
yarn generate            # Generate static site
yarn preview             # Preview production build

# Linting
yarn lint                # Run ESLint
yarn lint:fix            # Auto-fix lint issues
```

## Architecture

### Tech Stack
- **Frontend**: Nuxt 3, Vue 3 (Composition API), Vuetify 3
- **State Management**: Pinia (stores/auth.ts, stores/firebase.ts)
- **Backend**: Firebase 11 (Firestore, Storage, Auth via nuxt-vuefire)
- **3D**: Three.js r70 (legacy) with FirstPersonControls
- **SSR**: Disabled (static target)

### Key Directories
- `pages/` - Nuxt auto-routing with bracket notation for dynamic routes: `[region]`, `[meta]`
- `stores/` - Pinia stores: `auth.ts` (user state), `firebase.ts` (data operations)
- `composables/` - Vue composables: `useEventBus.ts` (mitt-based event bus)
- `components/three/` - 3D visualization: `ThreeBrain.js` manages scene, camera, rendering
- `components/three/js/` - ESLint ignored (legacy Three.js code)
- `plugins/` - Nuxt plugins: `firebase-auth.client.ts` for auth state initialization

### Data Model
- **Users**: Firebase Auth + Firestore profile (email, displayName, role)
- **Regions**: Spatial areas defined by points array, with hasRoles for access control
- **Metas**: Metadata/annotations attached to regions (title, comment, files, targetRole)

### Role-Based Access Control
Three permission levels: `GENERAL`, `EXPERT`, `PROJECT`. Regions and metas are filtered by user role. See `stores/firebase.ts` and `firestore.rules` for validation.

### Event-Driven Communication
Components communicate via mitt event bus (`composables/useEventBus.ts`). ThreeBrain subscribes to events: `DRAW_REGIONS`, `TOGGLE_REGIONS_VIEW`, `MOUSE_CLICK`, `TOGGLE_PICKING_MODE`.

## Code Style

- ESLint with `@nuxt/eslint-config`
- TypeScript for stores, composables, middleware, plugins
- Composition API with `<script setup lang="ts">` for components

## Firebase Configuration

- Project ID: `digital-idout`
- Firestore rules enforce schema validation (see `firestore.rules`)
- Storage rules in `storage.rules`
- Deploy: Firebase Hosting

## Migration Notes

This project was migrated from Nuxt 2 to Nuxt 3. Key changes:
- Vuex → Pinia
- Options API → Composition API
- asyncData → useAsyncData
- `_param` routes → `[param]` routes
- EventBus (Vue instance) → mitt
- static/ → public/
