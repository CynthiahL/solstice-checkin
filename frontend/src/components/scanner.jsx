import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode'; // Using the clean, explicit class to bypass bundler crashes
import { Camera, Keyboard, ScanLine, ArrowRight } from 'lucide-react';

export default function Scanner({ onScan, isDisabled }) {
  const [activeTab, setActiveTab] = useState('CAMERA'); // CAMERA, MANUAL
  const [textCode, setTextCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const html5QrcodeRef = useRef(null);

  // Optical Camera Scanning Lifecycle Engine
  useEffect(() => {
    // If the station is busy printing or the manual input tab is selected, tear down any active camera feeds
    if (isDisabled || activeTab !== 'CAMERA') {
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop()
          .then(() => {
            html5QrcodeRef.current = null;
            setCameraActive(false);
          })
          .catch((err) => console.log('Camera stop cleanup handled safely:', err));
      }
      return;
    }

    // Initialize the optical reader instance targeting our view layout frame container element
    const html5Qrcode = new Html5Qrcode('camera-viewport-frame');
    html5QrcodeRef.current = html5Qrcode;

    // Start video capture stream tracking loops automatically
    html5Qrcode.start(
      { facingMode: 'user' }, // Request front-facing/kiosk orientation optics lens
      {
        fps: 12,
        qrbox: { width: 220, height: 220 }
      },
      (decodedText) => {
        // Successful QR frame read achieved! Instantly halt lens matrix loops to lock execution threads
        if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
          html5QrcodeRef.current.stop()
            .then(() => {
              html5QrcodeRef.current = null;
              setCameraActive(false);
              onScan(decodedText.trim().toUpperCase()); // Forward clean data payload up to core Kiosk controller state machine
            })
            .catch((err) => console.error('Optical thread lock release exception:', err));
        }
      },
      () => { /* Quietly absorb frame scanning trace loops where a QR code matrix is not visible */ }
    )
    .then(() => setCameraActive(true))
    .catch((err) => {
      console.warn('Camera access denied or hardware busy:', err.message);
      setCameraActive(false);
    });

    // Cleanup resources and lock streams down cleanly when the UI component context unmounts
    return () => {
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop().catch(() => {});
      }
    };
  }, [isDisabled, activeTab, onScan]);

  const handleManualSubmission = (e) => {
    e.preventDefault();
    if (!textCode.trim() || isDisabled) return;
    onScan(textCode.trim().toUpperCase()); // Coerces manual inputs to clean casing standards before API handoffs
    setTextCode('');
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-2xl max-w-md mx-auto w-full backdrop-blur-sm">
      
      {/* Navigation Tab Anchors */}
      <div className="flex bg-slate-950 p-1.5 rounded-xl gap-1 mb-5 border border-slate-900">
        <button
          type="button"
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
          type="button"
          onClick={() => setActiveTab('MANUAL')}
          disabled={isDisabled}
          className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-lg transition-all ${
            activeTab === 'MANUAL' 
              ? 'bg-slate-800 text-indigo-400 shadow-md' 
              : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          Manual Code Input
        </button>
      </div>

      {/* Tab Panel Context Execution Container Layouts */}
      {isDisabled ? (
        <div className="bg-slate-950 aspect-video rounded-xl flex flex-col items-center justify-center border border-dashed border-slate-800 p-4">
          <p className="text-amber-400/80 text-xs font-semibold tracking-wider uppercase mb-1">Device Busy</p>
          <p className="text-slate-500 text-xs text-center max-w-[240px]">
            Hardware channel locked out-of-thread until print completion callback is recorded.
          </p>
        </div>
      ) : activeTab === 'CAMERA' ? (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-xl bg-slate-950 border border-slate-800/80 aspect-video flex items-center justify-center text-slate-600">
            {/* Target anchor element injected dynamically by the optical stream thread */}
            <div id="camera-viewport-frame" className="w-full h-full object-cover"></div>
            
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-500">
                <ScanLine className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
                <p className="text-xs text-center text-slate-400">Awaiting device camera clearance...</p>
                <p className="text-[10px] text-slate-600 text-center mt-1">Please ensure media authorization rights are granted.</p>
              </div>
            )}
          </div>
          <p className="text-slate-500 text-[11px] text-center leading-normal">
            Align the badge's QR matrix square clearly inside the active camera boundary window.
          </p>
        </div>
      ) : (
        <form onSubmit={handleManualSubmission} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={textCode}
              onChange={(e) => setTextCode(e.target.value)}
              placeholder="Enter Registration Code (e.g. QR_ATTENDEE_5)"
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
