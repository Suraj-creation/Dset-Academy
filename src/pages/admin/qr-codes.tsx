import { useState } from 'react';
import Head from 'next/head';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ExternalLink } from 'lucide-react';

const SITE_URL = 'https://dsetconsulting.com';

const platforms = [
  {
    name: 'OreBill AI™',
    slug: 'orebill-ai',
    tagline: 'Mining & Mineral Billing Automation',
    color: '#ff851b',
  },
  {
    name: 'PharmaAI',
    slug: 'pharmaai',
    tagline: 'Pharma Commercial Intelligence',
    color: '#10b981',
  },
  {
    name: 'MedicsIQ™',
    slug: 'medicsiq',
    tagline: 'AI Dermatology & Wellness Platform',
    color: '#22c55e',
  },
  {
    name: 'VoiceOps',
    slug: 'voiceops',
    tagline: 'Enterprise Voice Automation',
    color: '#06b6d4',
  },
  {
    name: 'SecureCloud™',
    slug: 'securecloud',
    tagline: 'Cloud Security Platform',
    color: '#5e17ea',
  },
  {
    name: 'EdgeBay IntelliFence™',
    slug: 'edgebay-intelligence',
    tagline: 'Enterprise AI at the Edge',
    color: '#5cc5ff',
  },
  {
    name: 'iPaS-RevOps™',
    slug: 'ipas-revops',
    tagline: 'Revenue Operations on Microsoft Marketplace',
    color: '#1e90ff',
  },
];

function downloadQR(slug: string, name: string) {
  const svgEl = document.getElementById(`qr-${slug}`) as unknown as SVGSVGElement;
  if (!svgEl) return;

  const svgData = new XMLSerializer().serializeToString(svgEl);
  const canvas = document.createElement('canvas');
  const size = 600;
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
    link.download = `${slug}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
}

export default function QRCodesAdmin() {
  const [size, setSize] = useState(180);

  return (
    <>
      <Head>
        <title>Platform QR Codes — DSeT Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-5xl mx-auto">

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Platform QR Codes</h1>
            <p className="text-gray-400">Download print-ready QR codes for visiting cards, event standees, and brochures.</p>
          </div>

          <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-white/5 border border-white/10 w-fit">
            <span className="text-sm text-gray-400">Preview size:</span>
            {[120, 180, 240].map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  size === s ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'
                }`}
              >
                {s === 120 ? 'Small' : s === 180 ? 'Medium' : 'Large'}
              </button>
            ))}
            <span className="text-xs text-gray-600">Downloaded PNG is always 600×600px</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((p) => {
              const url = `${SITE_URL}/product/${p.slug}`;
              return (
                <div
                  key={p.slug}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col items-center gap-4"
                >
                  <div className="text-center">
                    <div
                      className="text-xs font-bold uppercase tracking-widest mb-1"
                      style={{ color: p.color }}
                    >
                      {p.tagline}
                    </div>
                    <h2 className="text-lg font-semibold text-white">{p.name}</h2>
                  </div>

                  <div className="p-3 rounded-xl bg-white">
                    <QRCodeSVG
                      id={`qr-${p.slug}`}
                      value={url}
                      size={size}
                      fgColor="#0a0a0a"
                      bgColor="#ffffff"
                      level="M"
                      includeMargin={false}
                    />
                  </div>

                  <p className="text-gray-500 text-xs text-center break-all">{url}</p>

                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => downloadQR(p.slug, p.name)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                      style={{ background: p.color }}
                    >
                      <Download className="w-4 h-4" />
                      Download PNG
                    </button>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center p-2.5 rounded-lg border border-white/15 text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 p-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
            <p className="text-yellow-400 text-sm font-medium mb-1">Print guidelines</p>
            <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
              <li>Downloaded PNG is 600×600px — suitable for visiting cards and A4 brochures</li>
              <li>Always include a quiet zone (white border) of at least 4 modules around the QR</li>
              <li>Minimum print size: 2cm × 2cm for reliable scanning</li>
            </ul>
          </div>

        </div>
      </div>
    </>
  );
}
