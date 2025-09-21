export interface MenuContent {
  id: string;
  title: string;
  description: string;
  images?: string[];
  content?: string;
  type: 'page' | 'gallery' | 'list';
  items?: ContentItem[];
}

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  link?: string;
}

export interface MenuApiResponse {
  success: boolean;
  data: MenuContent;
  message?: string;
}
