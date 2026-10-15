<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <!-- Feeds set <language>; Polish feeds get Polish labels. -->
  <xsl:variable name="pl" select="/rss/channel/language = 'pl'"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="{/rss/channel/language}">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> - RSS Feed</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          :root {
            --bg: #13151a;
            --bg-subtle: #1a1d24;
            --text: #e8e8e0;
            --text-muted: #8b8b8b;
            --primary: #00ff41;
            --border: #2a2d35;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            padding: 2rem;
            max-width: 42rem;
            margin: 0 auto;
          }
          .banner {
            background: var(--bg-subtle);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 2rem;
          }
          .banner h2 {
            color: var(--primary);
            font-size: 0.875rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
          }
          .banner p {
            color: var(--text-muted);
            font-size: 0.9375rem;
          }
          .banner code {
            background: var(--bg);
            padding: 0.2em 0.4em;
            border-radius: 4px;
            font-size: 0.875em;
          }
          h1 {
            font-size: 1.5rem;
            margin-bottom: 0.25rem;
          }
          .description {
            color: var(--text-muted);
            margin-bottom: 2rem;
          }
          .posts { list-style: none; }
          .post {
            border-bottom: 1px solid var(--border);
            padding: 1.5rem 0;
          }
          .post:last-child { border-bottom: none; }
          .post-title {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
          }
          .post-title a {
            color: var(--text);
            text-decoration: none;
          }
          .post-title a:hover {
            color: var(--primary);
          }
          .post-meta {
            font-size: 0.8125rem;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
          }
          .post-meta .category {
            color: var(--primary);
            text-transform: capitalize;
          }
          .post-description {
            color: var(--text-muted);
            font-size: 0.9375rem;
          }
          a { color: var(--primary); }
        </style>
      </head>
      <body>
        <div class="banner">
          <h2>RSS Feed</h2>
          <p>
            <xsl:choose>
              <xsl:when test="$pl">Subskrybuj, wklejając ten adres do czytnika RSS: </xsl:when>
              <xsl:otherwise>Subscribe by copying this URL into your feed reader: </xsl:otherwise>
            </xsl:choose>
            <code><xsl:value-of select="/rss/channel/link"/>rss.xml</code>
          </p>
        </div>
        <h1><xsl:value-of select="/rss/channel/title"/></h1>
        <p class="description"><xsl:value-of select="/rss/channel/description"/></p>
        <ul class="posts">
          <xsl:for-each select="/rss/channel/item">
            <li class="post">
              <h2 class="post-title">
                <a>
                  <xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>
                  <xsl:value-of select="title"/>
                </a>
              </h2>
              <p class="post-meta">
                <xsl:value-of select="pubDate"/> · <span class="category"><xsl:value-of select="category"/></span>
              </p>
              <p class="post-description"><xsl:value-of select="description"/></p>
            </li>
          </xsl:for-each>
        </ul>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
