---
layout: page
title: Changelog
permalink: /changelog
---

## March 20, 2025

### New Content
- **Assassin's Creed Shadows:** Added a gallery with five new images.

## February 25, 2025

### New Content
- **Assassin's Creed Valhalla:** Added a gallery with six new images.

### Website Maintenance and Modernization
- **Resolved Jekyll Build Issues:**  Fixed a series of configuration and dependency problems that were preventing the site from building and serving correctly.  This involved:
    - Correcting the Jekyll version in the `Gemfile`.
    - Adding required gems (`ostruct`, `wdm`) to the `Gemfile`.
    - Removing the incompatible `jekyll-cache` plugin (and updating `_config.yml` accordingly).
    - Ensuring the `jekyll` gem was explicitly listed as a dependency.
    - Correcting a syntax error (missing `end`) in the `Gemfile`.
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