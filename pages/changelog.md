---
layout: page
title: Changelog
permalink: /changelog
---

## June 22, 2025

#### Content Updates
- **Red Dead Redemption**
  - Added 1 new image to the gallery

#### Technical Improvements
- Updated social media icons and links
- Improved site navigation with better iconography
- **Gallery Performance:**  
  Optimized gallery initialization and image loading for faster display
- **Loading Spinner:**  
  Added a loading spinner for better user feedback while images load
- **Banner Background:**  
  Improved dynamic background color extraction using Vibrant.js, with better fallback for dark mode
- **Responsive Design:**  
  Tweaked banner and gallery styles for improved appearance on all devices
- **Minor Fixes:**  
  Addressed small bugs and improved code structure for maintainability

---

### April 22, 2025

#### Major Updates
- **Complete Website Overhaul**
  - Redesigned UI/UX for better navigation
  - Improved mobile responsiveness
  - Updated color scheme and typography

---

### March 20, 2025

#### New Content
- **Assassin's Creed Shadows**
  - Added gallery with 5 high-quality images
  - Included detailed captions and metadata

---

### February 25, 2025

#### New Content
- **Assassin's Creed Valhalla**
  - Added gallery with 6 new images
  - Implemented responsive image loading

#### Technical Improvements
- **Build System**
  - Resolved Jekyll build issues
  - Updated dependencies in `Gemfile`:
    - Fixed Jekyll version compatibility
    - Added required gems: `ostruct`, `wdm`
    - Removed incompatible `jekyll-cache` plugin
  - Updated `_config.yml` for better performance
- **Modernized Sass:**  Updated the Sass stylesheets to use the modern `@use` and `@forward` rules, replacing the deprecated `@import` rule. This involved:
    - Moving Sass partials (`.scss` files) to the correct `assets/css` directory.
    - Updating `@import` statements to `@use` or `@forward` as appropriate.
    - Defining Sass variables within the partials where they are used, ensuring correct scoping.
    - Removing unnecessary front matter from `main.scss`.
    - Correcting file paths and names.

### Updates
- Updated the scroll bar to seamlessly integrate with the website’s design.

---

## December 13, 2024

### New Content
- **Infinity Nikki:** Added a gallery with two new screenshots.
- **Star Wars Outlaws:** Added a new screenshot.

### Updates
- Updated the changelog page.

---

## October 19, 2024

### Updates
- **Control:** Added two new images to the gallery.

---

## October 4, 2024

### New Content
- **Star Wars Outlaws:** Added new screenshots.
- **Starfield:** Added two new shots to the gallery.

---

## September 26, 2024

### Website Enhancements

#### New Features
- **Performance Improvements:**
  - Introduced a loading spinner for better user feedback.
  - Enabled lazy loading for banner images.
  - Added subtle hover effects on gallery images.
- **Styling Improvements:**
  - Updated banner height for responsive design.
  - Applied text shadow for improved text visibility.
  - Added smooth background transitions.

#### Fixes
- Implemented fallback dark background color in case Vibrant.js color retrieval fails.

---

## July 21, 2024

### Updates
- **Cyberpunk 2077:** Added two new images to the gallery.
- **Once Human:** Added two new images.

---

## June 18, 2024

### Updates
- Removed unused descriptions from gallery pages.
- **Starfield Fans:** Added five new images.

---

## June 1, 2024

### New Features
- **Banner Customization:**
  - Improved banner image appearance controls.
  - Introduced `darkeningFactor` for managing dark mode backgrounds.
  - New images now appear at the top of galleries.

### Optimizations
- Reorganized and optimized gallery initialization scripts.
- Cleaned up code and removed duplicate inclusions.

---

## May 31, 2024

### Updates
- Updated Swipebox and jQuery resources.
- Enhanced Changelog page.
- Added `/changelog` link to the navigation bar.

### Bug Fixes
- Fixed mobile image display issues.
- **Fallout 4:** Added two new screenshots.

---

## May 29, 2024

### Content Refresh
- **Gallery Improvements:**
  - Added Vibrant.js for future enhancements.
  - Re-uploaded Fallout 4 & The Division 2 content.
  - Added new images from *Ghost of Tsushima* and *Little Kitty, Big City*.
  - Alphabetized gallery items.

---

## March 29, 2024

### Updates
- Updated `header.html`.
- Removed the four-row Hamburger Menu.

---

## March 25, 2024

### Updates
- Resolved favicon issue.
- Updated `favicon.ico` and `footer.html`.
- Enhanced website design with rounded corners and hover effects.

---

## March 7, 2024

### Updates
- Implemented homepage grid layout.
- Added custom 404 page.
- Updated RDR2 and Control images.
- Updated Google Analytics and site settings.

---

## March 3-4, 2024

### Updates
- Styling updates for `_header.scss`, `pig.js`, and `main.scss`.
- Updated layout and fonts for *The Division 2*.

---

## March 2, 2024

### Updates
- Fixed banner offset and thumbnail display.
- Updated `README.md` and various configuration files.

---

*For more detailed information, please visit the [repository commit history](https://github.com/PatrickJnr/vp/commits/main).*