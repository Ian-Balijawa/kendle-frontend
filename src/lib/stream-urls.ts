export const getImageUrl = (filename: string) => {
  return `${import.meta.env.VITE_API_URL}/stream/image/${filename}`;
};

export const getVideoUrl = (filename: string) => {
  return `${import.meta.env.VITE_API_URL}/stream/video/${filename}`;
};

export const getPdfUrl = (filename: string) => {
  return `${import.meta.env.VITE_API_URL}/stream/pdf/${filename}`;
};
