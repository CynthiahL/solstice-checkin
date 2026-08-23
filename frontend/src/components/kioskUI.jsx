import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Loader2, CheckCircle2, AlertTriangle, RefreshCcw, UserCheck, ShieldCheck } from 'lucide-react';
import Scanner from './Scanner';

export default function KioskUI() {
  const [uiState, setUiState] = useState('IDLE'); // IDLE, PRINT_PENDING, CHECKED_IN, ERROR
  const [statusMessage, setStatusMessage] = useState('Please present your entry ticket or input your registration code.');
  const [activeAttendeeId, setActiveAttendeeId] = useState(null);
  const [attendeeDetails, setAttendeeDetails] = useState({ name: '', qrCode: '' });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Establish synchronization pipe to production cluster core backend server port
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (!socket || !activeAttendeeId) return;

    socket.emit('register_kiosk', activeAttendeeId);

    socket.on('status_updated', (payload) => {
      if (payload.status === 'CHECKED_IN') {
        setUiState('CHECKED_IN');
        setStatusMessage('Your badge has printed successfully! Please collect your badge below and enjoy the conference.');
      }
    });

    return () => {
      socket.off('status_updated');
    };
  }, [socket, activeAttendeeId]);

  const handleCheckinProcessing = async (qrCode) => {
    setUiState('PRINT_PENDING');
    setStatusMessage('Verifying digital signature allocation metrics and routing print requests...');
    setActiveAttendeeId(null);

    try {
      const response = await axios.post('http://localhost:3000/api/checkin/scan', 
        { qrCode },
        { headers: { 'Authorization': 'Bearer solstice_kiosk_secret_2026' } }
      );

      if (response.status === 202) {
        setActiveAttendeeId(response.data.attendeeId);
        setStatusMessage('Print instructions safely queued. Awaiting asynchronous device response confirmation...');
      }
    } catch (error) {
      setUiState('ERROR');
      if (error.response && error.response.status === 409) {
        setStatusMessage(error.response.data.message || 'Duplicate scan detected. This registration badge has already been issued.');
      } else {
        setStatusMessage(error.response?.data?.message || 'Inbound routing failure. Please contact event infrastructure management.');
      }
    }
  };

  const resetKiosk = () => {
    setUiState('IDLE');
    setStatusMessage('Please present your entry ticket or input your registration code.');
    setActiveAttendeeId(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans antialiased selection:bg-indigo-500/30">
      {/* Structural Branding Header */}
      <div className="max-w-xl w-full text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 text-xs font-semibold tracking-wider px-3.5 py-2 rounded-full uppercase border border-indigo-500/20 shadow-inner">
          <ShieldCheck className="w-3.5 h-3.5" />
          Solstice Events Co. • Kiosk Node Operational
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white mt-4 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
          Attendee Check-In Station
        </h1>
        <p className="text-slate-400 text-sm mt-2 font-medium">
          Digital Credential & Physical Badge Issuance Platform
        </p>
      </div>

      {/* Main Status Canvas Display Box */}
      <div className={`w-full max-w-md p-8 rounded-3xl mb-8 border transition-all duration-300 shadow-2xl flex flex-col items-center text-center backdrop-blur-md ${
        uiState === 'IDLE' ? 'bg-slate-900/60 border-slate-800' :
        uiState === 'PRINT_PENDING' ? 'bg-amber-950/20 border-amber-500/40 shadow-amber-900/20' :
        uiState === 'CHECKED_IN' ? 'bg-emerald-950/20 border-emerald-500/40 shadow-emerald-900/20' :
        'bg-rose-950/20 border-rose-500/40 shadow-rose-900/20'
      }`}>
        
        {uiState === 'IDLE' && <UserCheck className="w-16 h-16 text-slate-600 mb-5 stroke-[1.25]" />}
        {uiState === 'PRINT_PENDING' && <Loader2 className="w-16 h-16 text-amber-400 animate-spin stroke-[1.25] mb-5" />}
        {uiState === 'CHECKED_IN' && <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-5 stroke-[1.25] animate-pulse" />}
        {uiState === 'ERROR' && <AlertTriangle className="w-16 h-16 text-rose-400 mb-5 stroke-[1.25]" />}

        <h2 className={`font-bold text-2xl mb-2 tracking-tight ${
          uiState === 'IDLE' ? 'text-slate-200' :
          uiState === 'PRINT_PENDING' ? 'text-amber-300 animate-pulse' :
          uiState === 'CHECKED_IN' ? 'text-emerald-300' :
          'text-rose-300'
        }`}>
          {uiState === 'IDLE' ? 'System Status: Ready' :
           uiState === 'PRINT_PENDING' ? 'Processing Issuance...' :
           uiState === 'CHECKED_IN' ? 'Access Granted' :
           'Check-In Flagged'}
        </h2>

        <p className="text-slate-300 text-sm leading-relaxed max-w-xs mb-6 font-medium">
          {statusMessage}
        </p>

        {uiState !== 'IDLE' && uiState !== 'PRINT_PENDING' && (
          <button
            onClick={resetKiosk}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all border border-slate-800 shadow-md active:scale-95"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Return to Welcome Screen
          </button>
        )}
      </div>

      {/* Duel Verification Component Module */}
      <Scanner onScan={handleCheckinProcessing} isDisabled={uiState === 'PRINT_PENDING'} />
    </div>
  );
}
