const UNSPLASH_IMAGES = [
  {
    alt: "Mountain landscape",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=320&q=80",
  },
  {
    alt: "Foggy forest",
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a8fe05?auto=format&fit=crop&w=320&q=80",
  },
  {
    alt: "Ocean waves",
    src: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=320&q=80",
  },
  {
    alt: "Desert dunes",
    src: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=320&q=80",
  },
  {
    alt: "Northern lights",
    src: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=320&q=80",
  },
  {
    alt: "City skyline",
    src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=320&q=80",
  },
  {
    alt: "Cherry blossoms",
    src: "https://images.unsplash.com/photo-1522383228803-aa2f1e6461ce?auto=format&fit=crop&w=320&q=80",
  },
  {
    alt: "Snowy peaks",
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=320&q=80",
  },
  {
    alt: "Tropical beach",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=320&q=80",
  },
  {
    alt: "Starry night",
    src: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=320&q=80",
  },
] as const;

export function getRandomUnsplashImage() {
  return UNSPLASH_IMAGES[Math.floor(Math.random() * UNSPLASH_IMAGES.length)];
}
