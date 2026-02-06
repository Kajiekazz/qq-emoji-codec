
import { 
  HardDrive, 
  Github, 
  BookOpen, 
  Gamepad2,
  Settings,
  Terminal,
  Music,
  Image
} from 'lucide-react';
import { LinkItem, Category, SearchEngine } from './types';

export const APP_NAME = "Moeku's 导航页";
export const USER_NAME = "卡介菌";

// Background: User provided anime art
export const BACKGROUND_IMAGE = "https://t.alcy.cc/pc";

// USER PROFILE DATA
export const PROFILE = {
  avatar: "https://q2.qlogo.cn/headimg_dl?dst_uin=719571357&spec=0", 
  name: "卡介菌",
  title: "Giftia",
  bio: "时光流转，愿你与珍爱之人再度重逢",
  email: "moeku@foxmail.com",
  tags: ["Anime", "Code"],
  status: "Online ✨",
  gif: "https://telegraph-image-682.pages.dev/file/b6fcfd9b436273904d8c4.gif"
};

// MASCOT CONFIGURATION
export const MASCOT_IMAGES = {
  idle: "https://media1.tenor.com/m/t2U5-K9aXQoAAAAC/plastic-memories-isla.gif", 
  happy: "https://media1.tenor.com/m/7t6sHjC3lZAAAAAC/plastic-memories-isla.gif", 
  dizzy: "https://media1.tenor.com/m/OpM6O6W6t9AAAAAd/isla-plastic-memories-dizzy.gif", 
  crying: "https://media.tenor.com/images/f369568541775c1855bc05dc485b7c76/tenor.gif" 
};

// Simplified categories since we have few links
export const CATEGORIES: Category[] = [
  { id: 'main', label: 'All' },
];

export const SEARCH_ENGINES: SearchEngine[] = [
  { name: 'Google', url: 'https://www.google.com/search', queryParam: 'q', placeholder: 'Ask anything...' },
  { name: 'Bilibili', url: 'https://search.bilibili.com/all', queryParam: 'keyword', placeholder: 'Search videos...' },
];

export const LINKS: LinkItem[] = [
  {
    id: '1',
    title: 'My Blog',
    url: 'https://blog.moeku.org',
    description: 'Notes & Thoughts',
    icon: BookOpen,
    color: 'sakura-500',
    category: 'main'
  },
  {
    id: '2',
    title: 'Netdisk',
    url: 'https://cloud.guguwo.top',
    description: 'Cloud Storage',
    icon: HardDrive,
    color: 'sky-400',
    category: 'main'
  },
  {
    id: '3',
    title: 'Bilibili',
    url: 'https://space.bilibili.com/439704151',
    description: 'Anime & Fun',
    icon: Gamepad2,
    color: 'pink-400',
    category: 'media'
  },
  {
    id: '4',
    title: 'GitHub',
    url: 'https://github.com/Kajiekazz',
    description: 'My Projects',
    icon: Github,
    color: 'slate-700',
    category: 'dev'
  },
];
