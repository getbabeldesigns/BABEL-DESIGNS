# Project Context: Babel Designs

This document provides the necessary context for any AI model or developer to understand the current state and structure of the **Babel Designs** project.

## 🚀 Project Overview
**Babel Designs** is a modern, high-end web application built with Next.js, focusing on premium aesthetics, 3D interactions, and smooth animations. It appears to be a portfolio or showcase for an interior design studio.

## 🛠️ Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [GSAP](https://greensock.com/gsap/), [Framer Motion](https://www.framer.com/motion/)
- **3D Graphics**: [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://docs.pmnd.rs/react-three-drei)
- **Language**: TypeScript

## 📂 Project Structure
- `src/app/`: Contains the main application routes and layouts.
  - `page.tsx`: The primary landing page.
  - `layout.tsx`: Root layout with fonts and metadata.
- `src/components/`: Modular UI components.
  - `navbar/`: Navigation components (Magnetic effects, mobile menu).
  - `hero/`: Hero sections (likely 3D/Animation heavy).
  - `sections/`: Page sections like `CollectionsGrid`, `PhilosophySection`, etc.
  - `sidebars/`: Interaction sidebars (Cart, User menu).
- `src/styles/`: Global CSS and Tailwind configurations.
- `public/`: Static assets (images, icons).

## 📝 Project History

### 2026-04-06 17:20
- **Latest File Updated**: `src/components/navbar/Navbar.tsx`
- **Context of Update**: The Navbar has been implemented with magnetic button effects, custom scrolling transitions, and integrated `CartSidebar` and `UserSidebar` components. It handles both 'light' and 'dark' themes.

### 2026-04-06 17:34
- **Security Hardening**: Implemented Content Security Policy (CSP), HSTS, and other security headers in `next.config.ts`.
- **Dependency Audit**: Updated `ajv` to mitigate moderate ReDoS vulnerabilities.
- **Infrastructure Cleanup**: Removed unnecessary debug artifacts (`debug.log`, `testspite.json`).

## 🎯 Current Focus
Continuing development on core UI components while maintaining the newly established security infrastructure.

---
*Last Updated: 2026-04-06 17:38 (Server Time)*
