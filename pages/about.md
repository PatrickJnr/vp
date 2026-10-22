---
layout: page
title: About
permalink: /about
description: "Virtual photography by PatrickJr., composed and framed inside the games I play."
---

{% assign sp = site.data.virtual-photography['Red-Dead-Redemption-2'][17] %}
{%- assign sa = site.posts | where: 'slug', 'Red-Dead-Redemption-2' | first %}
{%- capture sp_srcset %}{% include srcset.html photo=sp %}{% endcapture -%}

<p class="lead">I take virtual photographs: screenshots composed and framed inside the games I play.</p>

Most of my time in a game goes on looking around. I like finding a place that is worth stopping at, waiting for the light to sit right, and working out where the camera should go. The photo mode is the tool that lets me do that, and a good one makes a game feel like somewhere you can actually take pictures.

I use whatever camera tools a game gives me: free cameras, depth of field, field of view, time of day and weather where they are offered. I keep the screenshots I like and leave the rest. Nothing here is a commission or a job. It is a collection of pictures I enjoyed making.

<figure class="figure">
  <a href="{{ sa.url | relative_url }}#{{ sp.id }}">
    <img src="{{ sp.variants[2].path | relative_url }}" srcset="{{ sp_srcset | strip }}" sizes="(max-width: 800px) 100vw, 800px" width="{{ sp.width }}" height="{{ sp.height }}" alt="A man in a red waistcoat holds up a glowing lantern against a dark blue night sky" decoding="async">
  </a>
  <figcaption>Red Dead Redemption 2</figcaption>
</figure>

Each game has its own album. If you want to see what is here, start with the [albums]({{ '/albums/' | relative_url }}).
