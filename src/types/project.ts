export type Media = {
  type: 'image' | 'video';
  src: string;
  poster?: string;
  /** Dimensions réelles (images), calculées côté serveur pour réserver la place */
  width?: number;
  height?: number;
};

export type Project = {
  title: string;
  slug: string;
  category: string;
  media: Media[];
  content: string;
  featured?: boolean;
  archive?: boolean;
  home?: boolean;
  homeOrder?: number | null;
  /** Résumé court affiché dans l'aperçu Commissions */
  summary?: string;
  /** Lien externe facultatif (site du projet) */
  url?: string;
  year?: string;
};
