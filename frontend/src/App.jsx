import React from 'react';
import KioskUI from './components/KioskUI'; // 👈 Removed explicit extension to let Vite auto-resolve format types cleanly

export default function App() {
  return <KioskUI />;
}
