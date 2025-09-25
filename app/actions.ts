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
    
    // We don't need to store the file on the server
    // Just return success and let the client handle the file
    
    // Revalidate the page to reflect any changes
    revalidatePath('/');
    
    return { 
      success: true, 
      message: 'File loaded successfully, redirecting to analysis...',
      fileName: file.name,
      redirectUrl: `/analysis`
    };
  } catch (error) {
    console.error('Error processing file:', error);
    return { 
      success: false, 
      message: 'Error processing file' 
    };
  }
}