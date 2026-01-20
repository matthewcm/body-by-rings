'use client';

/**
 * Utility component for handling WOD image selection from camera or gallery
 */
export type ScanType = 'gallery' | 'camera';

export interface ImageHandlerResult {
  base64Image: string | null;
  cancelled: boolean;
}

/**
 * Handles image selection from camera or gallery
 * Returns a promise that resolves with the base64 image data or null if cancelled
 */
export const handleGetWodImage = async (type: ScanType): Promise<ImageHandlerResult> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    if (type === 'camera') {
      input.capture = 'environment';
    }
    
    let resolved = false;
    
    // Handle cancellation (user closes file picker without selecting)
    const handleCancel = () => {
      if (!resolved) {
        resolved = true;
        resolve({ base64Image: null, cancelled: true });
      }
    };
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      
      if (!file) {
        if (!resolved) {
          resolved = true;
          resolve({ base64Image: null, cancelled: true });
        }
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (!resolved) {
          resolved = true;
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1]; // Remove data:image/...;base64, prefix
          resolve({ base64Image: base64Data, cancelled: false });
        }
      };
      reader.onerror = () => {
        if (!resolved) {
          resolved = true;
          resolve({ base64Image: null, cancelled: true });
        }
      };
      reader.readAsDataURL(file);
    };
    
    // Handle window focus loss (user might have cancelled by clicking away)
    const handleWindowFocus = () => {
      // Small delay to allow onchange to fire first if file was selected
      setTimeout(() => {
        if (!resolved) {
          handleCancel();
        }
      }, 300);
    };
    
    // Listen for window focus to detect cancellation
    window.addEventListener('focus', handleWindowFocus, { once: true });
    
    input.click();
    
    // Cleanup listener after a reasonable timeout
    setTimeout(() => {
      window.removeEventListener('focus', handleWindowFocus);
      if (!resolved) {
        handleCancel();
      }
    }, 60000); // 60 second timeout
  });
};
