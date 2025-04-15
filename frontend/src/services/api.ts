import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Adjust if backend runs elsewhere

export interface CharacterDetection { // Exporting for potential use elsewhere
  id: number;
  image_id: number;
  bbox_x: number;
  bbox_y: number;
  bbox_w: number;
  bbox_h: number;
  confidence?: number | null;
}

export interface Image { // Exporting for potential use elsewhere
  id: number;
  filename: string;
  filepath: string;
  timestamp: string; // ISO format string
  detections?: CharacterDetection[]; // Use the defined interface
}

export const uploadImage = async (file: File): Promise<Image> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post<Image>(`${API_URL}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading image:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Upload failed: ${error.response.data.detail || error.message}`);
    }
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getImages = async (): Promise<Image[]> => {
  try {
    const response = await axios.get<Image[]>(`${API_URL}/images`);
    return response.data;
  } catch (error) {
    console.error("Error fetching images:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Fetching images failed: ${error.response.data.detail || error.message}`);
    }
    throw new Error(`Fetching images failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getImageUrl = (filepath: string): string => {

    const filename = filepath.split(/\/|\\/).pop(); // Get filename from path
    if (filename) {
        return `${API_URL}/static/images/${filename}`;
    }
    console.warn("Could not determine filename from filepath for getImageUrl:", filepath);
    return ''; // Return empty string or a placeholder image URL
}

export const getImageDetails = async (imageId: number): Promise<Image> => {
    try {
        const response = await axios.get<Image>(`${API_URL}/images/${imageId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for image ${imageId}:`, error);
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(`Fetching image details failed: ${error.response.data.detail || error.message}`);
        }
        throw new Error(`Fetching image details failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
