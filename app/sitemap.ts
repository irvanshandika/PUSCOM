import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const links = [
    {
      url: 'https://puscom.web.id', // Replace with your homepage
      lastModified: new Date(),
    },
  ]
  return links;
}