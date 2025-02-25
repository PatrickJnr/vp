# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "vp"
  spec.version       = "2.4.0"
  spec.authors       = ["PatrickJr"]
  spec.email         = ["admin@grimtech.co.uk"]

  spec.summary       = "A virtual photography portfolio website built with Jekyll." # More descriptive summary
  spec.homepage      = "https://vp.grimtech.co.uk"
  spec.license       = "MIT"

  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(test|spec|features)/}) } +
    Dir["*.{md,txt,rdoc}"] +  # Include top-level Markdown, text, and RDoc files
    Dir["_{layouts,includes,sass,data,posts}/**/*"] +  # Include subdirectories recursively
    Dir["assets/**/*"] +   # Include the assets directory and subdirectories
    ["Gemfile", "Gemfile.lock", "_config.yml"] # Include important files
  end
  
  spec.add_runtime_dependency "jekyll", "~> 4.4" # Match your Jekyll version
  spec.add_runtime_dependency "webrick", "~> 1.9", ">= 1.9.1"  # Include webrick


  spec.add_runtime_dependency 'jemoji', '~> 0.13.0'
  spec.add_runtime_dependency 'jekyll-paginate', '~> 1.1'
  spec.add_runtime_dependency 'jekyll-mentions'
  spec.add_runtime_dependency 'jekyll-sitemap', '~> 1.4'
  spec.add_runtime_dependency 'jekyll-feed', '~> 0.17.0'
  spec.add_runtime_dependency 'jekyll-seo-tag', '~> 2.8'
  spec.add_runtime_dependency 'ostruct'

end