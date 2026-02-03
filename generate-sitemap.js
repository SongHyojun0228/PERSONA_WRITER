import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env files
dotenv.config({ path: '.env.development' });
dotenv.config({ path: '.env.production', override: true });


const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and Anon Key are required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://persona-writer.vercel.app'; // TODO: Confirm and update this domain

async function generateSitemap() {
  console.log('Generating sitemap...');

  // Fetch all published stories
  const { data: stories, error: storiesError } = await supabase
    .from('published_stories')
    .select('id, created_at, user_id');

  if (storiesError) {
    console.error('Error fetching stories:', storiesError);
    return;
  }

  const storyUrls = stories.map(story => `
    <url>
      <loc>${BASE_URL}/story/${story.id}</loc>
      <lastmod>${new Date(story.created_at).toISOString().split('T')[0]}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`).join('');

  // Deduplicate user IDs
  const userIds = [...new Set(stories.map(story => story.user_id))];

  // For users, we don't have a last modified date, so we'll use today's date
  const today = new Date().toISOString().split('T')[0];
  const userUrls = userIds.map(userId => `
    <url>
      <loc>${BASE_URL}/users/${userId}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>`).join('');

  // The root path '/' requires login, so it might be better to point to the Community/Explore page if one exists as the main landing page for crawlers, or just exclude it if login is mandatory to see any content. For now, I'll assume a public landing page exists at root.
  const staticUrls = `
    <url>
      <loc>${BASE_URL}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
    <url>
      <loc>${BASE_URL}/search</loc>
      <lastmod>${today}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `;

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticUrls}
  ${storyUrls}
  ${userUrls}
</urlset>`;

  const sitemapPath = path.resolve('public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapContent.trim());

  console.log("Sitemap generated successfully at " + sitemapPath);
  console.log('NOTE: The domain ' + BASE_URL + ' is a placeholder. Please update it to your actual production domain.');
}

generateSitemap();
