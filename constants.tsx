import { ThumbnailStyle, StyleOption } from './types';
import { 
  Pencil, 
  Palette, 
  Camera, 
  Shapes, 
  Zap, 
  Smile, 
  Box, 
  Film 
} from 'lucide-react';
import React from 'react';

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: ThumbnailStyle.REALISTIC,
    label: 'Realistic Photo',
    description: 'High fidelity, photorealistic textures',
    iconName: 'Camera'
  },
  {
    id: ThumbnailStyle.FUTURISTIC,
    label: 'Futuristic',
    description: 'Neon lights, tech elements, cyberpunk',
    iconName: 'Zap'
  },
  {
    id: ThumbnailStyle.CINEMATIC,
    label: 'Cinematic',
    description: 'Dramatic lighting, movie-poster quality',
    iconName: 'Film'
  },
  {
    id: ThumbnailStyle.RENDER_3D,
    label: '3D Render',
    description: 'Pixar/Blender style, clean shapes',
    iconName: 'Box'
  },
  {
    id: ThumbnailStyle.CARTOON,
    label: 'Cartoon',
    description: 'Bold lines, vibrant anime/comic style',
    iconName: 'Smile'
  },
  {
    id: ThumbnailStyle.OIL_PAINTING,
    label: 'Oil Painting',
    description: 'Rich textures, artistic strokes',
    iconName: 'Palette'
  },
  {
    id: ThumbnailStyle.DRAWING,
    label: 'Sketch',
    description: 'Hand-drawn, rough or detailed pencil',
    iconName: 'Pencil'
  },
  {
    id: ThumbnailStyle.ABSTRACT,
    label: 'Abstract',
    description: 'Conceptual, geometric, surreal',
    iconName: 'Shapes'
  },
];

export const getIconComponent = (name: string) => {
  switch (name) {
    case 'Pencil': return <Pencil className="w-6 h-6" />;
    case 'Palette': return <Palette className="w-6 h-6" />;
    case 'Camera': return <Camera className="w-6 h-6" />;
    case 'Shapes': return <Shapes className="w-6 h-6" />;
    case 'Zap': return <Zap className="w-6 h-6" />;
    case 'Smile': return <Smile className="w-6 h-6" />;
    case 'Box': return <Box className="w-6 h-6" />;
    case 'Film': return <Film className="w-6 h-6" />;
    default: return <Camera className="w-6 h-6" />;
  }
};