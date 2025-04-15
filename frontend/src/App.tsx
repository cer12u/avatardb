import { useState } from 'react';
import './App.css'; // Keep or modify base styles
import { ImageUpload } from './components/ImageUpload'; // Adjust path if needed
import { ImageList } from './components/ImageList'; // Adjust path if needed
import { Toaster } from "@/components/ui/toaster" // Assuming shadcn/ui toast

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey(prevKey => prevKey + 1); // Increment key to force re-render/re-fetch in ImageList
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header className="text-center py-6">
        <h1 className="text-3xl font-bold tracking-tight">Character DB Prototype</h1>
      </header>
      <main className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Upload New Image</h2>
          <ImageUpload onUploadSuccess={handleUploadSuccess} />
        </section>
        <section>
           {/* Pass key to ImageList to trigger refresh */}
          <ImageList refreshTrigger={refreshKey} />
        </section>
      </main>
      <Toaster /> {/* Add Toaster for notifications */}
    </div>
  );
}

export default App;
