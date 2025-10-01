---
layout: page
title: Changelog
permalink: /changelog
---

## October 1, 2025

### Content Updates
- **Game Post Updates**
  - Updated 16 game posts with latest information and corrections
  - **Grand Theft Auto V** → Updated sales figures to 195+ million copies, added GTA Online info
  - **Fallout 4** → Added PS5/Xbox Series XS platforms, mentioned 2024 next-gen update
  - **Red Dead Redemption 2** → Updated sales figures to 55+ million copies
  - **The Division 2** → Fixed release date, removed discontinued Google Stadia platform
  - **Control** → Added awards and ray tracing achievement info
  - **Ghost of Tsushima** → Added Director's Cut and Iki Island expansion details
  - **Assassin's Creed Valhalla** → Added post-launch expansion information
  - **Cyberpunk 2077** → Fixed date format, added Phantom Liberty expansion info
  - **Starfield** → Added Xbox Game Pass launch and Shattered Space expansion details
  - **Assassin's Creed Mirage** → Added Valhalla prequel context
  - **Horizon Forbidden West** → Corrected PS5 release date (2022), added PC release info (2024)
  - **Little Kitty, Big City** → Added indie success information
  - **Once Human** → Added free-to-play launch details
  - **Star Wars Outlaws** → Added reception and atmosphere details
  - **Infinity Nikki** → Added free-to-play model information
  - **Assassin's Creed Shadows** → Added delay information (Nov 2024 → Mar 2025)

### Technical Updates
- **JavaScript Code Quality**
  - Fixed 80+ ESLint errors and warnings across all files
  - Updated variable declarations from `var` → `let` / `const` for better scoping
  - Fixed prototype method access (replaced direct `hasOwnProperty` calls)
  - Resolved lexical declaration issues in `case` blocks
  - Improved code maintainability and modern JavaScript compliance

- **Ruby Gem & Jekyll**
  - Upgraded Jekyll → `~> 4.4.1`
  - Updated plugins: jemoji `~> 0.13.0`, jekyll-mentions `~> 1.6.0`
  - Removed jekyll-minifier `~> 0.1.0` to reduce maintenance overhead
  - Updated core dependencies: webrick `~> 1.9.1`, rack `~> 3.0.0`
  - Added Sinatra framework gems for extended functionality
  - Resolved Windows compatibility with `wdm >= 0.1.0`
  - Added `ostruct ~> 0.6.1` for improved Ruby object handling

- **Color System Removal**
  - Removed dynamic color palette from game posts
  - Eliminated Vibrant.js dependency and related scripts
  - Fixed CORS issues caused by external image color analysis
  - Simplified banner styling with static gradients

- **Theme Implementation**
  - Implemented Catppuccin Mocha theme across the site
  - Updated `_variables.scss` with Catppuccin palette
  - Applied consistent theming to headers, footers, and content areas
  - Enhanced visual consistency with predefined gradients & shadows

- **Documentation**
  - Updated README.md to replace Imgur with LensDump
  - Removed outdated Imgur API documentation
  - Corrected directory structure references
  - Updated third-party service references

---

## September 30, 2025

### Technical Updates
- **Hosting**
  - Moved image hosting to **LensDump** (Imgur blocked in UK)

---

## June 26, 2025

### Content Updates
- Enhanced game posts with:
  - Platforms, genres, themes metadata
  - Photo mode details and trivia sections
  - Backward compatibility with existing image references

### Technical Improvements
- **Color Palette System**
  - Expanded palette from 8 → 10 colors
  - Light-to-dark sorting for better readability
  - Added click-to-copy color codes
  - Optimized extraction targeting 30 unique colors

- **UI/UX**
  - Redesigned game metadata with grid layout
  - Added Trivia section (2 facts per game)
  - Improved color loading feedback
  - Enhanced responsive design

---

## June 22, 2025

### Content Updates
- **Red Dead Redemption**
  - Added 1 new gallery image

### Technical Improvements
- Updated social media icons & links
- Improved site navigation with better iconography
- **Gallery Performance** → Faster initialization & loading
- **Loading Spinner** → Added for better feedback
- **Banner Background** → Improved Vibrant.js fallback for dark mode
- **Responsive Design** → Tweaked banner & gallery styles
- **Minor Fixes** → Bug fixes & code cleanup

---

## April 22, 2025

### Major Update
- **Complete Website Overhaul**
  - Redesigned UI/UX for better navigation
  - Improved mobile responsiveness
  - Updated color scheme and typography

---

## March 20, 2025

### New Content
- **Assassin's Creed Shadows**
  - Added gallery with 5 HQ images + captions & metadata

---

## February 25, 2025

### New Content
- **Assassin's Creed Valhalla**
  - Added gallery with 6 new images
  - Implemented responsive image loading

### Technical Improvements
- **Build System**
  - Fixed Jekyll build issues
  - Updated dependencies in `Gemfile`
    - Fixed Jekyll version compatibility
    - Added `ostruct`, `wdm`
    - Removed `jekyll-cache` plugin
  - Optimized `_config.yml`

- **Modernized Sass**
  - Replaced deprecated `@import` with `@use` / `@forward`
  - Moved partials to `assets/css`
  - Scoped Sass variables properly
  - Removed unnecessary front matter from `main.scss`
  - Corrected file paths & names

### UI/UX
- Updated scroll bar design to match site

---

## December 13, 2024

### New Content
- **Infinity Nikki** → Added 2 screenshots  
- **Star Wars Outlaws** → Added 1 screenshot  

### Updates
- Updated changelog page

---

## October 19, 2024

### Updates
- **Control** → Added 2 new gallery images

---

## October 4, 2024

### New Content
- **Star Wars Outlaws** → Added new screenshots  
- **Starfield** → Added 2 new shots  

---

## September 26, 2024

### Website Enhancements
- **Performance**
  - Loading spinner for user feedback
  - Lazy loading for banners
  - Hover effects on gallery images
- **Styling**
  - Updated banner height
  - Added text shadow for visibility
  - Smooth background transitions
- **Fixes**
  - Dark background fallback if Vibrant.js fails

---

## July 21, 2024

### Updates
- **Cyberpunk 2077** → Added 2 new images  
- **Once Human** → Added 2 new images  

---

## June 18, 2024

### Updates
- Removed unused gallery descriptions  
- **Starfield Fans** → Added 5 new images  

---

## June 1, 2024

### New Features
- **Banner Customization**
  - Improved appearance controls
  - Added `darkeningFactor` for dark mode
  - New images now appear at the top

### Optimizations
- Reorganized gallery scripts
- Cleaned duplicate code

---

## May 31, 2024

### Updates
- Updated Swipebox & jQuery
- Enhanced changelog page
- Added `/changelog` to navigation

### Bug Fixes
- Fixed mobile image display
- **Fallout 4** → Added 2 screenshots

---

## May 29, 2024

### Content Refresh
- **Gallery Improvements**
  - Added Vibrant.js integration
  - Re-uploaded Fallout 4 & Division 2 content
  - Added *Ghost of Tsushima* + *Little Kitty, Big City* images
  - Alphabetized gallery items

---

## March 29, 2024

### Updates
- Updated `header.html`
- Removed 4-row Hamburger Menu

---

## March 25, 2024

### Updates
- Fixed favicon issues
- Updated `favicon.ico` & `footer.html`
- Rounded corners & hover effects added

---

## March 7, 2024

### Updates
- Implemented homepage grid layout
- Added custom 404 page
- Updated RDR2 & Control images
- Updated Google Analytics settings

---

## March 3–4, 2024

### Updates
- Styling updates for `_header.scss`, `pig.js`, `main.scss`
- Updated layout & fonts for *The Division 2*

---

## March 2, 2024

### Updates
- Fixed banner offset & thumbnails
- Updated `README.md` & configs

---

*For more details, see the [repository commit history](https://github.com/PatrickJnr/vp/commits/main).*
