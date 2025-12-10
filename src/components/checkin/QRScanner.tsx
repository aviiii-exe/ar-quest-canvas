import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Camera, X, QrCode } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QR_CODE_PREFIX } from '@/constants/app';

interface QRScannerProps {
  onScan: (siteId: string) => void;
  onError?: (error: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanning = async () => {
    if (!containerRef.current) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1
        },
        (decodedText) => {
          // Parse QR code - expecting format: "hampi-heritage:site_id"
          if (decodedText.startsWith(QR_CODE_PREFIX)) {
            const siteId = decodedText.replace(QR_CODE_PREFIX, '');
            onScan(siteId);
            stopScanning();
            setIsOpen(false);
          } else {
            onError?.('Invalid QR code format');
          }
        },
        () => {
          // Ignore errors during scanning
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Failed to start scanner:', err);
      onError?.('Failed to access camera');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the container is rendered
      setTimeout(() => {
        startScanning();
      }, 100);
    } else {
      stopScanning();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <QrCode className="h-4 w-4" />
          Scan QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Heritage Site QR Code
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div 
            id="qr-reader" 
            ref={containerRef}
            className="w-full max-w-[300px] aspect-square rounded-lg overflow-hidden bg-muted"
          />
          <p className="text-sm text-muted-foreground text-center">
            Point your camera at the QR code located at the heritage site to check in
          </p>
          {isScanning && (
            <Button variant="outline" onClick={stopScanning}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRScanner;
