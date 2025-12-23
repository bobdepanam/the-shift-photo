export type Media = {
  type: 'image' | 'video';
  src: string;
  poster?: string;
};

export type Project = {
  title: string;
  slug: string;
  category: string;
  media: Media[];
  content: string;
  featured?: boolean;
};
