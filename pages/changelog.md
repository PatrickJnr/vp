---
layout: page
title: Changelog
permalink: /changelog
description: A log of changes to PatrickJr.'s virtual photography site.
class: changelog
---

## October 22, 2026

### Redesign
- Redesigns the homepage, album index, album pages and text pages around the photographs.
- Opens the homepage on Selected Work, with the site name in the header as "PatrickJr. Virtual Photography".
- Shows the licence, social links and this changelog in a compact single-row footer that stays at the bottom of short pages.
- Lists Latest Albums by publication date and shows clearer album counts.
- Adds larger navigation and outline hover and focus feedback on screenshots.
- Adds an image viewer with keyboard and touch navigation, zoom, pan and fullscreen.
- Rewrites the About page and tidies the Contact and Privacy pages.
- Removes the Platforms, Genres, Themes, Photo Mode Features and Did You Know panels from every album.
- Removes emoji support, jQuery, Swipebox, Font Awesome and MathJax.

### Images
- Hosts all 179 screenshots on this site as optimised WebP files at several sizes, plus a full resolution version.
- Replaces the Lensdump uploader with an offline gallery generator. The README describes the workflow.

### Analytics and privacy
- Asks before loading Google Analytics. Nothing loads from Google until a visitor accepts, and rejecting or ignoring the banner sends nothing.
- Adds a Privacy page, a footer link and a way to change the choice at any time.
- Records which screenshots and albums are viewed, the first zoom, fullscreen and download, and clicks to other sites.
- Fixes keyboard shortcuts in the viewer stopping after the zoom buttons reach their limit.

### Dependencies
- Reduces the Gemfile to Jekyll, jekyll-feed, jekyll-seo-tag and jekyll-sitemap, plus WEBrick and wdm for local development.
- Removes jemoji, jekyll-mentions, jekyll-admin, Sinatra, Rack and the unused Sass and Node tooling.

## October 1, 2025

### Content
- Updates 16 game posts with current information and corrections:
  - Grand Theft Auto V: sales figures of 195+ million copies, GTA Online information.
  - Fallout 4: PS5 and Xbox Series X|S platforms, the 2024 next-gen update.
  - Red Dead Redemption 2: sales figures of 55+ million copies.
  - The Division 2: corrected release date, removes the discontinued Google Stadia platform.
  - Control: awards and ray tracing achievement.
  - Ghost of Tsushima: Director's Cut and Iki Island expansion.
  - Assassin's Creed Valhalla: post-launch expansions.
  - Cyberpunk 2077: corrected date format, Phantom Liberty expansion.
  - Starfield: Xbox Game Pass launch, Shattered Space expansion.
  - Assassin's Creed Mirage: Valhalla prequel context.
  - Horizon Forbidden West: corrected PS5 release date (2022), PC release (2024).
  - Little Kitty, Big City: indie success.
  - Once Human: free-to-play launch.
  - Star Wars Outlaws: reception and atmosphere.
  - Infinity Nikki: free-to-play model.
  - Assassin's Creed Shadows: delay from November 2024 to March 2025.

### Technical
- Fixes the hamburger menu: resolves an undefined `menuLinks` variable, adds the missing `main.js` script tag, and fixes layering.
- Fixes ESLint errors, replaces `var` with `let` and `const`, and fixes lexical declarations in `case` blocks.
- Upgrades Jekyll to `~> 4.4.1` and updates jemoji, jekyll-mentions, WEBrick, Rack and `wdm`. Adds Sinatra and `ostruct`. Removes jekyll-minifier.
- Removes the dynamic colour palette and Vibrant.js, which also fixes CORS errors from external image analysis.
- Applies the Catppuccin Mocha theme across headers, footers and content.
- Replaces the Font Awesome CDN stylesheet with the Font Awesome kit script.
- Moves all JavaScript files to `assets/js/`: `jquery.swipebox.js`, `main.js` and `pig.js`.
- Removes the background effect from the envelope icon in the social links.
- Updates the README to replace Imgur with Lensdump and removes the outdated Imgur API notes.

## September 30, 2025

- Moves image hosting to Lensdump, because Imgur is blocked in the UK.

## June 26, 2025

### Content
- Adds platforms, genres and themes to game posts.
- Adds photo mode details and trivia sections.
- Keeps existing image references working.

### Technical
- Expands the colour palette from 8 to 10 colours, sorted light to dark, with click-to-copy colour codes and extraction tuned for 30 unique colours.
- Redesigns the game metadata grid, adds the Trivia section, improves colour loading feedback and the responsive layout.

## June 22, 2025

- Adds 1 screenshot to Red Dead Redemption 2.
- Updates social media icons and links, and improves navigation and iconography.
- Speeds up gallery initialisation and loading, and adds a loading spinner.
- Improves the banner background fallback when Vibrant.js fails.
- Tweaks the responsive banner and gallery, with minor fixes and cleanup.

## April 22, 2025

- Redesigns the whole site: new interface, better mobile layout, updated colours and typography.

## March 31, 2025

- Adds an Assassin's Creed Shadows album with 5 screenshots.

## February 25, 2025

### Content
- Adds an Assassin's Creed Valhalla album with 6 screenshots and responsive loading.

### Technical
- Fixes Jekyll build issues, updates the `Gemfile`, removes `jekyll-cache` and tidies `_config.yml`.
- Replaces Sass `@import` with `@use` and `@forward`, moves the partials to `assets/css` and scopes variables.
- Updates the scroll bar design.

## December 13, 2024

- Adds 2 Infinity Nikki screenshots and 1 Star Wars Outlaws screenshot.
- Updates this page.

## October 19, 2024

- Adds 2 Control screenshots.

## October 4, 2024

- Adds 3 Star Wars Outlaws screenshots and 2 Starfield screenshots.

## September 26, 2024

- Adds a loading spinner, lazy loading for banners and hover effects on gallery images.
- Updates the banner height, adds a text shadow and smooths background transitions.
- Adds a dark background fallback when Vibrant.js fails.

## July 21, 2024

- Adds 2 Cyberpunk 2077 screenshots and 2 Once Human screenshots.

## June 18, 2024

- Removes unused gallery descriptions.
- Adds 5 Starfield screenshots.

## June 1, 2024

- Improves the banner controls and adds a `darkeningFactor` for dark mode.
- Shows new images at the top of each gallery.
- Reorganises the gallery scripts and removes duplicate code.

## May 31, 2024

- Updates Swipebox and jQuery.
- Adds this page and a `/changelog` link in the navigation.
- Fixes mobile image display.
- Adds 2 Fallout 4 screenshots.

## May 29, 2024

- Adds Vibrant.js.
- Re-uploads the Fallout 4 and The Division 2 screenshots.
- Adds Ghost of Tsushima and Little Kitty, Big City.
- Sorts the albums alphabetically.

## March 29, 2024

- Updates `header.html`.
- Removes the 4-row hamburger menu.

## March 25, 2024

- Fixes the favicon and updates `favicon.ico` and `footer.html`.
- Adds rounded corners and hover effects.

## March 7, 2024

- Adds the homepage grid layout and a custom 404 page.
- Updates the Red Dead Redemption 2 and Control screenshots.
- Updates Google Analytics.

## March 3 to 4, 2024

- Updates the styling in `_header.scss`, `pig.js` and `main.scss`.
- Updates the layout and fonts for The Division 2.

## March 2, 2024

- Fixes the banner offset and thumbnails.
- Updates `README.md` and the configuration.

For more detail, see the [repository commit history](https://github.com/PatrickJnr/vp/commits/main).
