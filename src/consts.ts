import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'mensi',
  description:
    'Knowledge spreader and cybersecurity enthusiast based in Algeria.',
  href: 'https://hxuu.github.io',
  author: 'prpl',
  locale: 'en-US',
  featuredPostCount: 2,
  postsPerPage: 5,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/blog',
    label: 'blog',
  },
  {
    href: '/tags',
    label: 'tags',
  },
  {
    href: '/authors',
    label: 'authors',
  },
  {
    href: '/about',
    label: 'about',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://github.com/mensi-commits',
    label: 'GitHub',
  },
  {
    href: 'https://www.youtube.com/@dexter-2425',
    label: 'Youtube',
  },
  {
    href: 'https://www.linkedin.com/in/mohamed-amine-mensi-214946285/',
    label: 'LinkedIn',
  },
  {
    href: 'mailto:mensimohamedamine25@gmail.com',
    label: 'Email',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Youtube: 'lucide:youtube',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
}
