import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, Keyboard, ScanLine, ArrowRight } from 'lucide-react';

export default function Scanner({ onScan, isDisabled }) {
  const [activeTab, setActiveTab] = useState('CAMERA'); // CAMERA, MANUAL
  const [textCode, setTextCode] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    if (isDisabled || activeTab !== 'CAMERA') {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      return;
    }

    const scanner = new Html5QrcodeScanner('camera-viewport-frame', {
      fps: 12,
      qrbox: { width: 220, height: 220 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [0] // Camera-based input streams only
    });

    scanner.render(
      (decodedText) => {
        scanner.clear()
          .then(() => {
            scannerRef.current = null;
            onScan(decodedText);
          })
          .catch((err) => console.error('Capture lock exception:', err));
      },
      () => { /* Mute frame capturing alerts */ }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [isDisabled, activeTab]);

  const handleManualSubmission = (e) => {
    e.preventDefault();
    if (!textCode.trim() || isDisabled) return;
    onScan(textCode.trim().toUpperCase());
    setTextCode('');
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-2xl max-w-md mx-auto w-full backdrop-blur-sm">
      {/* Navigation Tab Anchors */}
      <div className="flex bg-slate-950 p-1.5 rounded-xl gap-1 mb-5 border border-slate-900">
        <button
          onClick={() => setActiveTab('CAMERA')}
          disabled={isDisabled}
          className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-lg transition-all ${
            activeTab === 'CAMERA' 
              ? 'bg-slate-800 text-emerald-400 shadow-md' 
              : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'
          }`}
        >
          <Camera className="w-4 h-4" />
          Optical Lens Scan
        </button>
        <button
          onClick={() => setActiveTab('MANUAL')}
          disabled={isDisabled}
          className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-lg transition-all ${
            activeTab === 'MANUAL' 
              ? 'bg-slate-800 text-indigo-400 shadow-md' 
              : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          Manual Key Input
        </button>
      </div>

      {/* Tab Panel Context Execution Boxes */}
      {isDisabled ? (
        <div className="bg-slate-950 aspect-video rounded-xl flex flex-col items-center justify-center border border-dashed border-slate-800 p-4">
          <p className="text-amber-400/80 text-xs font-semibold tracking-wider uppercase mb-1">Device Busy</p>
          <p className="text-slate-500 text-xs text-center max-w-[240px]">Hardware channel locked out-of-thread until print completion callback is recorded.</p>
        </div>
      ) : activeTab === 'CAMERA' ? (
        <div className="space-y-3">
          <div id="camera-viewport-frame" className="overflow-hidden rounded-xl bg-slate-950 border border-slate-800/80 aspect-video flex items-center justify-center text-slate-600">
            {/* Target element for html5-qrcode renderer container */}
          </div>
          <p className="text-slate-500 text-[11px] text-center leading-normal">
            Align the entry ticket's QR matrix square within the camera targeting bounds box.
          </p>
        </div>
      ) : (
        <form onSubmit={handleManualSubmission} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={textCode}
              onChange={(e) => setTextCode(e.target.value)}
              placeholder="Enter Registration Code (e.g. QR_ATTENDEE_4)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-11 py-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 tracking-wide font-mono transition-colors uppercase"
              autoFocus
            />
            <ScanLine className="absolute right-3.5 top-4 text-slate-600 w-4 h-4 animate-pulse" />
          </div>
          <button
            type="submit"
            disabled={!textCode.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-950/20 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            Authorize Access
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </div>
  );
}
