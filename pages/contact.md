---
layout: page
title: Contact
permalink: /contact
description: Email and social accounts for PatrickJr.
---

For questions about the screenshots, or anything else, send an email or message me on one of the accounts below.

<p class="contact-mail"><a href="mailto:admin@grimtech.co.uk"><span class="icon" aria-hidden="true">mail</span>admin@grimtech.co.uk</a></p>

## Elsewhere

<ul class="link-list">
{%- for s in site.data.settings.social %}
  <li><a href="{{ s.link }}" rel="me noopener" target="_blank">{{ s.name }}<span class="sr"> (opens in a new tab)</span><span class="icon" aria-hidden="true">arrow_outward</span></a></li>
{%- endfor %}
</ul>

## Licence

The screenshots on this site are licensed under [Creative Commons Attribution-NonCommercial 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Please credit PatrickJr. and link back to this site when you share them.
