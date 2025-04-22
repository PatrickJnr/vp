# Virtual Photography Portfolio

[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fvp.grimtech.co.uk&style=for-the-badge)](https://vp.grimtech.co.uk/) [![GitHub Pages Status](https://img.shields.io/github/deployments/PatrickJnr/vp/github-pages?label=GitHub%20Pages&style=for-the-badge)](https://patrickjnr.github.io/vp) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT) [![GitHub last commit](https://img.shields.io/github/last-commit/PatrickJnr/vp?style=for-the-badge)](https://github.com/PatrickJnr/vp/commits/main) [![GitHub commit activity](https://img.shields.io/github/commit-activity/m/PatrickJnr/vp?style=for-the-badge)](https://github.com/PatrickJnr/vp/commits/main)<br>
[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/PatrickJnr/vp?style=for-the-badge)](https://github.com/PatrickJnr/vp) [![GitHub top language](https://img.shields.io/github/languages/top/PatrickJnr/vp?style=for-the-badge)](https://github.com/PatrickJnr/vp) [![GitHub language count](https://img.shields.io/github/languages/count/PatrickJnr/vp?style=for-the-badge)](https://github.com/PatrickJnr/vp) <img alt="Made with Jekyll" src="https://img.shields.io/badge/Made%20with-Jekyll-blue?logo=jekyll&style=for-the-badge"> <img alt="Images Hosted with Imgur" src="https://img.shields.io/badge/Images_Hosted_with-Imgur-green?logo=imgur&style=for-the-badge">

This website showcases a collection of virtual photography captured in various video games by PatrickJr.

**Live Website:** [https://vp.grimtech.co.uk/](https://vp.grimtech.co.uk/)

**GitHub Pages Mirror:** [https://patrickjnr.github.io/vp](https://patrickjnr.github.io/vp)

## About

The site is built using [Jekyll](https://jekyllrb.com/), a static site generator, and hosted on [GitHub Pages](https://pages.github.com/). Images are hosted on [Imgur](https://imgur.com/). New content and updates are tracked on the [changelog](https://vp.grimtech.co.uk/changelog) page.

## Features

- Responsive design optimized for all devices
- Automatic image gallery generation with thumbnails
- SEO optimization with Jekyll SEO Tag
- RSS feed support
- Google Analytics integration
- Disqus comments integration
- Emoji support via Jemoji
- Social media mentions support
- Custom 404 error page
- Automatic sitemap generation

## Prerequisites

- Ruby >= 2.7.0
- Bundler >= 2.5.0
- Node.js (for optional JavaScript dependencies)
- Python 3.x (for the image upload script)

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

3. Install Python dependencies (for image upload script):
   ```bash
   pip install -r requirements.txt
   ```

## Local Development

1. Start the Jekyll server:
   ```bash
   bundle exec jekyll serve
   ```
   Or use the provided script:
   ```bash
   ./run.bat
   ```

2. Visit `http://localhost:4000` in your browser

## Image Upload Script

The repository includes a Python script (`generate_albumv3.py`) for automatically uploading images to Imgur and generating the necessary gallery data. To use it:

1. Create a `.env` file with your Imgur API credentials:
   ```
   CLIENT_ID=your_client_id
   CLIENT_SECRET=your_client_secret
   ACCESS_TOKEN=your_access_token
   REFRESH_TOKEN=your_refresh_token
   ```

2. Run the script with a directory containing images:
   ```bash
   python generate_albumv3.py path/to/image/directory
   ```

The script will:
- Create thumbnails in multiple sizes
- Upload images to Imgur
- Generate a JSON file with image data
- Clean up temporary files

## Configuration

Key configuration files:

- `_config.yml`: Main Jekyll configuration
- `_data/settings.yml`: Site settings
- `_data/navigation.yml`: Navigation menu structure
- `_data/ui-text.yml`: UI text strings

## Directory Structure

```
vp/
├── _data/          # Site data files
├── _includes/      # Reusable components
├── _layouts/       # Page templates
├── _plugins/       # Jekyll plugins
├── _posts/         # Blog posts
├── assets/         # Static assets
│   ├── css/       # Stylesheets
│   └── img/       # Images
├── js/            # JavaScript files
└── pages/         # Static pages
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

### Code

The code for this website is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### Screenshots

All screenshots in this portfolio are copyright PatrickJr and are licensed under a [Creative Commons Attribution-NonCommercial 4.0 International License](https://creativecommons.org/licenses/by-nc/4.0/). This means you are free to share and use the screenshots for non-commercial purposes, as long as you give appropriate credit.

## Contact

PatrickJr - [admin@grimtech.co.uk](mailto:admin@grimtech.co.uk)

Project Link: [https://github.com/PatrickJnr/vp](https://github.com/PatrickJnr/vp)