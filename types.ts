
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

export type TextPosition = 
  | 'top-left' | 'top-center' | 'top-right' 
  | 'middle-left' | 'center' | 'middle-right' 
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface TextOverlayConfig {
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  position: TextPosition;
  isBold: boolean;
  isItalic: boolean;
}
