import { ThumbnailStyle, StyleOption, TextPosition } from './types';
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

export const POPULAR_FONTS = [
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Lato",
  "Poppins",
  "Oswald",
  "Bebas Neue",
  "Anton",
  "League Spartan",
  "Raleway",
  "Merriweather",
  "Nunito",
  "Playfair Display",
  "Rubik",
  "Bangers",
  "Heebo",
  "Righteous",
  "Lobster",
  "Barlow",
  "Fira Sans"
];

export const TEXT_COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
  { name: 'Yellow', value: '#FACC15' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Pink', value: '#EC4899' },
];

export const POSITION_GRID: { id: TextPosition, label: string }[] = [
  { id: 'top-left', label: 'TL' },
  { id: 'top-center', label: 'TC' },
  { id: 'top-right', label: 'TR' },
  { id: 'middle-left', label: 'ML' },
  { id: 'center', label: 'C' },
  { id: 'middle-right', label: 'MR' },
  { id: 'bottom-left', label: 'BL' },
  { id: 'bottom-center', label: 'BC' },
  { id: 'bottom-right', label: 'BR' },
];