export type Media = {
    type: 'image' | 'video';
    src: string;
  };
  
  export type Project = {
    title: string;
    slug: string;
    category: string;
    media: Media[];
    content: string; // contenu markdown transformé en HTML ou MDX si besoin
  };
  