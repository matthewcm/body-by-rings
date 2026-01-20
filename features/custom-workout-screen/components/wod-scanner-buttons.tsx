'use client';

import { ActivityIndicator, Button, Text } from '@/lib/ui/components';
import { Camera, Image, X } from 'lucide-react';
import { ScanType } from './wod-image-handler';

interface WodScannerButtonsProps {
  onScan: (type: ScanType) => void;
  onCancel?: () => void;
  isScanning: boolean;
  scanningType: ScanType | null;
}

export const WodScannerButtons = ({
  onScan,
  onCancel,
  isScanning,
  scanningType,
}: WodScannerButtonsProps) => {
  const handleCameraClick = () => {
    if (!isScanning) {
      onScan('camera');
    }
  };

  const handleGalleryClick = () => {
    if (!isScanning) {
      onScan('gallery');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const isCameraActive = isScanning && scanningType === 'camera';
  const isGalleryActive = isScanning && scanningType === 'gallery';
  const isCameraDisabled = isScanning && !isCameraActive;
  const isGalleryDisabled = isScanning && !isGalleryActive;

  return (
    <div className="flex flex-row gap-2 mb-5 border-b border-border pb-5 flex-wrap w-full">
      {/* Camera Button */}
      <Button
        variant="secondary"
        onClick={handleCameraClick}
        disabled={isCameraDisabled}
        className={`
          flex-1 flex flex-row items-center justify-center gap-2 w-fit
          ${isCameraDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isCameraActive ? 'bg-primary/20 border-primary' : ''}
        `}
      >
        {isCameraActive ? (
          <>
            <ActivityIndicator size="small" />
            <Text className="font-bold text-nowrap">Scanning...</Text>
          </>
        ) : (
          <>
            <Camera className="w-4 h-4" />
            <Text className="font-bold text-nowrap">Scan WOD Board</Text>
          </>
        )}
      </Button>

      {/* Gallery Button */}
      <Button
        variant="secondary"
        onClick={handleGalleryClick}
        disabled={isGalleryDisabled}
        className={`
          flex-1 flex flex-row items-center justify-center gap-2 w-fit
          ${isGalleryDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isGalleryActive ? 'bg-primary/20 border-primary' : ''}
        `}
      >
        {isGalleryActive ? (
          <>
            <ActivityIndicator size="small" />
            <Text className="font-bold text-nowrap">Scanning...</Text>
          </>
        ) : (
          <>
            <Image className="w-4 h-4" />
            <Text className="font-bold text-nowrap">WOD from gallery</Text>
          </>
        )}
      </Button>

      {/* Cancel Button - Only show when scanning */}
      {isScanning && onCancel && (
        <Button
          variant="destructive"
          onClick={handleCancel}
          className="flex flex-row items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          <Text className="font-bold text-nowrap">Cancel</Text>
        </Button>
      )}
    </div>
  );
};
