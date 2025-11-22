import React, { Suspense } from 'react';
const LazyHello = React.lazy(() => import('./components/Hello.jsx'));

function App () {
  return (
    <div>
      <h1>MERN Week 7 Demo</h1>
      <Suspense fallback={<p>Loading chunk...</p>}>
        <LazyHello />
      </Suspense>
    </div>
  );
}

export default App;
