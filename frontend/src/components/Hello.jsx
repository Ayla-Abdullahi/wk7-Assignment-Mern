import React, { useEffect, useState } from 'react';

export default function Hello () {
  const [apiStatus, setApiStatus] = useState(null);
  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL;
    fetch(`${base}/api/health`).then(r => r.json()).then(d => setApiStatus(d.status)).catch(() => setApiStatus('error'));
  }, []);
  return (
    <div>
      <p>Code splitting works! Backend status: {apiStatus || 'loading...'}</p>
    </div>
  );
}
