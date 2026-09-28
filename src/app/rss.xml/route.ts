import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCachedSettings } from '@/lib/cache';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mystore.com';
  
  const settingsMap = await getCachedSettings();
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "My Store";
  const rssBeforeContent = settingsMap.RSS_BEFORE_CONTENT || '';
  const rssAfterContent = settingsMap.RSS_AFTER_CONTENT || 'L\'article {post_link} est apparu en premier sur {blog_link}.';

  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { author: true }
  });

  const generateRssContent = (article: any) => {
    let content = article.content || article.excerpt || '';
    
    const postLink = `<a href="${baseUrl}/blog/${article.slug}">${article.title}</a>`;
    const blogLink = `<a href="${baseUrl}/blog">${storeName} Blog</a>`;
    const authorName = article.author?.name || storeName;
    
    let before = rssBeforeContent
      .replace(/{post_link}/g, postLink)
      .replace(/{blog_link}/g, blogLink)
      .replace(/{author}/g, authorName);
      
    let after = rssAfterContent
      .replace(/{post_link}/g, postLink)
      .replace(/{blog_link}/g, blogLink)
      .replace(/{author}/g, authorName);

    if (before) {
      content = `<p>${before}</p><hr/>` + content;
    }
    
    if (after) {
      content = content + `<hr/><p>${after}</p>`;
    }
    
    // HTML Encode content for RSS
    return content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  };

  const feedItems = articles.map(article => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/blog/${article.slug}</link>
      <guid>${baseUrl}/blog/${article.slug}</guid>
      <pubDate>${new Date(article.createdAt).toUTCString()}</pubDate>
      ${article.author ? `<dc:creator><![CDATA[${article.author.name}]]></dc:creator>` : ''}
      <description><![CDATA[${generateRssContent(article)}]]></description>
    </item>
  `).join('');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${storeName} - Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Derniers articles de ${storeName}</description>
    <language>fr</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${feedItems}
  </channel>
</rss>`;

  return new NextResponse(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
