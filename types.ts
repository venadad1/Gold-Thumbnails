export enum ThumbnailStyle {
  DRAWING = 'Drawing / Sketch',
  OIL_PAINTING = 'Oil Painting',
  REALISTIC = 'Realistic Photo',
  ABSTRACT = 'Abstract',
  FUTURISTIC = 'Futuristic / Cyberpunk',
  CARTOON = 'Cartoon / Anime',
  RENDER_3D = '3D Render',
  CINEMATIC = 'Cinematic'
}

export enum ThumbnailQuality {
  STANDARD = 'Standard',
  PRO = 'Pro'
}

export interface StyleOption {
  id: ThumbnailStyle;
  label: string;
  description: string;
  iconName: string; // We will use Lucide icons mapped by name
}

export interface GenerationConfig {
  prompt: string;
  style: ThumbnailStyle;
  quality: ThumbnailQuality;
  characterImage?: string; // Base64
}