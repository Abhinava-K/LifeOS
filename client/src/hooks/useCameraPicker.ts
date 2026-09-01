import { useState } from 'react';

export const useCameraPicker = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const captureImage = async () => {
    setImageUri('https://via.placeholder.com/600x400');
  };

  const clearImage = () => setImageUri(null);

  return { imageUri, captureImage, clearImage };
};
