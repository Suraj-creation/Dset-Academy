'use client';
import { useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode } from 'lucide-react';

interface PlatformQRCodeProps {
  url: string;
  platformName: string;
  color: string;
}

export default function PlatformQRCode({ url, platformName, color }: PlatformQRCodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleDownload = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const link = document.createElement('a');
      link.download = `${platformName.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  }, [platformName]);

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm w-fit mx-auto">
      <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
        <QrCode className="w-4 h-4" style={{ color }} />
        <span>Scan to explore {platformName}</span>
      </div>

      <div className="p-3 rounded-xl bg-white">
        <QRCodeSVG
          ref={svgRef}
          value={url}
          size={160}
          fgColor="#0a0a0a"
          bgColor="#ffffff"
          level="M"
          includeMargin={false}
        />
      </div>

      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white/80 border border-white/20 hover:bg-white/10 transition-colors duration-200"
      >
        <Download className="w-3.5 h-3.5" />
        Download QR
      </button>

      <p className="text-white/40 text-[11px] text-center max-w-[180px] leading-relaxed">
        {url.replace('https://', '')}
      </p>
    </div>
  );
}
