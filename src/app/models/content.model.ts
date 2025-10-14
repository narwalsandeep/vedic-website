export interface MenuContent {
  id: string;
  title: string;
  description: string;
  images?: string[];
  content?: string;
  type: 'page' | 'gallery' | 'list';
  template?: 'default' | 'activities' | 'events' | 'contact' | 'about' | 'blog';
  items?: ContentItem[];
}

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  images?: string[]; // For gallery items
  link?: string;
  category?: string; // For grouping items (e.g., trustee categories)
}

export interface MenuApiResponse {
  success: boolean;
  data: MenuContent;
  message?: string;
}
