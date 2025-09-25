'use server';

import { revalidatePath } from 'next/cache';

export async function uploadPgn(formData: FormData) {
  try {
    // Get the uploaded file from the form data
    const file = formData.get('file') as File;
    
    if (!file) {
      return { 
        success: false, 
        message: 'No file uploaded' 
      };
    }
    
    // Check if the file is a PGN file
    if (!file.name.endsWith('.pgn')) {
      return { 
        success: false, 
        message: 'File must be a PGN file' 
      };
    }
    
    // In the future, we'll add logic here to analyze the file
    // For now, we just return success
    
    // Revalidate the page to reflect any changes
    revalidatePath('/');
    
    return { 
      success: true, 
      message: 'File uploaded successfully',
      fileName: file.name
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { 
      success: false, 
      message: 'Error uploading file' 
    };
  }
}