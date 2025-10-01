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
- **Hamburger Menu Overhaul**
  - Fixed critical JavaScript bug: Resolved undefined `menuLinks` variable
  - Added missing `main.js` script tag
  - Enhanced frosted glass design with gradients and blur
  - Improved mobile UX with smooth animations and accessibility features
  - Fixed z-index issues for proper layering
  - Created `run.bat` script for development workflow

- **JavaScript Code Quality**
  - Fixed 80+ ESLint errors
  - Updated `var` → `let` / `const`
  - Fixed prototype method access
  - Resolved lexical declaration issues in `case` blocks
  - Improved code maintainability

- **Ruby Gem & Jekyll**
  - Upgraded Jekyll → `~> 4.4.1`
  - Updated plugins: jemoji `~> 0.13.0`, jekyll-mentions `~> 1.6.0`
  - Removed jekyll-minifier to reduce maintenance overhead
  - Updated core dependencies: webrick `~> 1.9.1`, rack `~> 3.0.0`
  - Added Sinatra framework gems
  - Resolved Windows compatibility with `wdm >= 0.1.0`
  - Added `ostruct ~> 0.6.1`

- **Color System Removal**
  - Removed dynamic color palette and Vibrant.js
  - Fixed CORS issues from external image analysis
  - Simplified banner styling with static gradients

- **Theme Implementation**
  - Applied Catppuccin Mocha theme
  - Updated `_variables.scss` with Catppuccin palette
  - Consistent theming across headers, footers, content
  - Enhanced gradients & shadows

- **FontAwesome Upgrade**
  - Replaced CDN CSS link with FontAwesome kit script for better performance
  - Updated to use: `https://kit.fontawesome.com/ba5cec19da.js`
  - Improved loading times and customization options

- **JavaScript File Organization**
  - Moved all JavaScript files to `assets/js/` directory
  - Updated file references in `_includes/head.html` and `_layouts/post.html`
  - Files moved: `jquery.swipebox.js`, `main.js`, `pig.js`
  - Improved project structure and maintainability

- **Social Media Icon Styling**
  - Removed #f39c12 background effect from fa-envelope icon
  - Maintained hover animations and color transitions
  - Cleaner visual appearance for social media icons

- **Documentation**
  - Updated README.md to replace Imgur with LensDump
  - Removed outdated Imgur API docs
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
- Enhanced game posts with platforms, genres, themes metadata
- Added photo mode details and trivia sections
- Maintained backward compatibility with existing image references

### Technical Improvements
- **Color Palette System**
  - Expanded from 8 → 10 colors
  - Light-to-dark sorting
  - Click-to-copy color codes
  - Optimized extraction for 30 unique colors

- **UI/UX**
  - Redesigned game metadata grid layout
  - Added Trivia section
  - Improved color loading feedback
  - Enhanced responsive design

---

## June 22, 2025

### Content Updates
- **Red Dead Redemption**
  - Added 1 new gallery image

### Technical Improvements
- Updated social media icons & links
- Improved navigation and iconography
- **Gallery Performance** → Faster initialization & loading
- **Loading Spinner** → Added for feedback
- **Banner Background** → Improved Vibrant.js fallback
- **Responsive Design** → Tweaked banner & gallery
- Minor bug fixes & code cleanup

---

## April 22, 2025

### Major Update
- Complete website overhaul: redesigned UI/UX, improved mobile responsiveness, updated color scheme & typography

---

## March 20, 2025

### New Content
- **Assassin's Creed Shadows**
  - Added gallery with 5 HQ images + captions & metadata

---

## February 25, 2025

### New Content
- **Assassin's Creed Valhalla**
  - Added gallery with 6 images, responsive loading

### Technical Improvements
- **Build System**
  - Fixed Jekyll build issues
  - Updated `Gemfile` dependencies
  - Removed `jekyll-cache`
  - Optimized `_config.yml`

- **Modernized Sass**
  - Replaced `@import` with `@use` / `@forward`
  - Moved partials to `assets/css`
  - Scoped variables properly
  - Corrected file paths & names

- **UI/UX**
  - Updated scroll bar design

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
  - Added text shadow
  - Smooth background transitions
- **Fixes**
  - Dark background fallback if Vibrant.js fails

---

## July 21, 2024

### Updates
- **Cyberpunk 2077** → Added 2 images
- **Once Human** → Added 2 images

---

## June 18, 2024

### Updates
- Removed unused gallery descriptions
- **Starfield Fans** → Added 5 images

---

## June 1, 2024

### New Features
- **Banner Customization**
  - Improved appearance controls
  - Added `darkeningFactor` for dark mode
  - New images appear at the top

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
  - Added *Ghost of Tsushima* + *Little Kitty, Big City*
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
- Rounded corners & hover effects

---

## March 7, 2024

### Updates
- Implemented homepage grid layout
- Added custom 404 page
- Updated RDR2 & Control images
- Updated Google Analytics

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
