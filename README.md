# PatrickJr's Virtual Photography Portfolio

[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fvp.grimtech.co.uk&style=for-the-badge)](https://vp.grimtech.co.uk/) [![GitHub Pages Status](https://img.shields.io/github/deployments/PatrickJnr/vp/github-pages?label=GitHub%20Pages&style=for-the-badge)](https://patrickjnr.github.io/vp) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT) [![GitHub last commit](https://img.shields.io/github/last-commit/PatrickJnr/vp?style=for-the-badge)](https://github.com/PatrickJnr/vp/commits/main) [![GitHub commit activity](https://img.shields.io/github/commit-activity/m/PatrickJnr/vp?style=for-the-badge)](https://github.com/PatrickJnr/vp/commits/main)<br>
[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/PatrickJnr/vp?style=for-the-badge)](https://github.com/PatrickJnr/vp) [![GitHub top language](https://img.shields.io/github/languages/top/PatrickJnr/vp?style=for-the-badge)](https://github.com/PatrickJnr/vp) [![GitHub language count](https://img.shields.io/github/languages/count/PatrickJnr/vp?style=for-the-badge)](https://github.com/PatrickJnr/vp) <img alt="Made with Jekyll" src="https://img.shields.io/badge/Made%20with-Jekyll-blue?logo=jekyll&style=for-the-badge"> <img alt="Images Hosted with Imgur" src="https://img.shields.io/badge/Images_Hosted_with-Imgur-green?logo=imgur&style=for-the-badge">

A modern, responsive portfolio website showcasing virtual photography captured in various video games by PatrickJr. The site is built with Jekyll and enhanced with modern web technologies.

**🌐 Live Website:** [https://vp.grimtech.co.uk/](https://vp.grimtech.co.uk/)

**🔄 GitHub Pages Mirror:** [https://patrickjnr.github.io/vp](https://patrickjnr.github.io/vp)

## About

The site is built using [Jekyll](https://jekyllrb.com/), a static site generator, and hosted on [GitHub Pages](https://pages.github.com/). Images are hosted on [Imgur](https://imgur.com/). New content and updates are tracked on the [changelog](https://vp.grimtech.co.uk/changelog) page.

## ✨ Features

- 🎨 Responsive design optimized for all devices
- 📸 Automatic image gallery generation with thumbnails
- 🔍 SEO optimization with Jekyll SEO Tag
- 📡 RSS feed support
- 📊 Google Analytics 4 integration
- 💬 Social media mentions support
- 😊 Emoji support via Jemoji
- 🚀 Modern build process with Node.js
- 🖼️ Automated image processing
- 🗺️ Automatic sitemap generation
- 🔗 Social media integration
- 📱 Mobile-first design

## 🚀 Prerequisites

- Ruby >= 3.0.0
- Bundler >= 2.3.0
- Node.js >= 16.0.0 (for frontend assets)
- Python 3.x (for image processing scripts)
- Jekyll >= 4.3.0

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/PatrickJnr/vp.git
   cd vp
   ```

2. Install Ruby dependencies:
   ```bash
   bundle install
   ```

3. Install Node.js dependencies:
   ```bash
   npm install
   ```

4. Install Python dependencies (for image processing scripts):
   ```bash
   pip install -r requirements.txt
   ```

## 🛠️ Local Development

1. Start the development server:
   ```bash
   # Using the provided script (recommended)
   ./run.bat
   
   # Or manually
   bundle exec jekyll serve --livereload
   ```

2. The site will be available at `http://localhost:4000`

3. For production build:
   ```bash
   JEKYLL_ENV=production bundle exec jekyll build
   ```

## 🖼️ Image Processing

The repository includes a Python script for processing and uploading images:

### `generate_albumv3.py`

This script handles image processing and Imgur uploads:

1. Create a `.env` file with your Imgur API credentials:
   ```env
   CLIENT_ID=your_client_id
   CLIENT_SECRET=your_client_secret
   ACCESS_TOKEN=your_access_token
   REFRESH_TOKEN=your_refresh_token
   ```

2. Run the script with a directory containing images:
   ```bash
   python generate_albumv3.py path/to/image/directory
   ```

### Features:
- Automatic thumbnail generation
- Batch image processing
- Imgur upload integration
- Metadata handling
- JSON data generation for galleries

## ⚙️ Configuration

### Key Files
- `_config.yml` - Main Jekyll configuration
- `package.json` - Node.js dependencies and scripts
- `Gemfile` - Ruby dependencies

### Data Files
- `_data/settings.yml` - Site settings
- `_data/navigation.yml` - Navigation structure
- `_data/ui-text.yml` - UI text strings
- `_data/*.json` - Various data files for galleries and content

## 📁 Directory Structure

```
vp/
├── .github/          # GitHub workflows and templates
├── _data/            # Site data files
│   ├── galleries/    # Gallery data
│   ├── settings/     # Configuration files
│   └── *.yml         # YAML data files
├── _includes/        # Reusable components
├── _layouts/         # Page templates
├── _plugins/         # Jekyll plugins
├── _posts/           # Blog posts
├── _site/            # Generated site (not in version control)
├── assets/           # Static assets
│   ├── css/         # Compiled CSS
│   ├── img/         # Images and icons
│   └── js/          # Source JavaScript
├── js/              # Frontend JavaScript
├── node_modules/     # Node.js dependencies
├── pages/            # Static pages
├── .gitignore        # Git ignore rules
├── .env.example      # Example environment variables
├── Gemfile           # Ruby dependencies
├── package.json      # Node.js dependencies
└── generate_albumv3.py # Image processing script
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

### Code

This project is open source and available under the [MIT License](LICENSE).

### Content

All virtual photography and screenshots are © PatrickJr and are licensed under a [Creative Commons Attribution-NonCommercial 4.0 International License](https://creativecommons.org/licenses/by-nc/4.0/).

### Third-Party

- [Jekyll](https://jekyllrb.com/)
- [Node.js](https://nodejs.org/)
- [Imgur API](https://apidocs.imgur.com/)

## 📬 Contact

For inquiries, collaborations, or feedback:

- ✉️ Email: [admin@grimtech.co.uk](mailto:admin@grimtech.co.uk)
- 🌐 Website: [https://vp.grimtech.co.uk](https://vp.grimtech.co.uk)
- 💻 GitHub: [PatrickJnr/vp](https://github.com/PatrickJnr/vp)

---

Made with ❤️ by PatrickJr | [MIT License](LICENSE) | [View Changelog](https://vp.grimtech.co.uk/changelog)