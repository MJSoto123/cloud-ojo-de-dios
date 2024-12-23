import React from "react";
import UploadVideo from "./components/UploadVideo";

const UploadPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 w-full px-4">
      <h1 className="text-5xl font-bold text-gray-800 mb-8">Subir Video</h1>
      <p className="text-xl text-gray-600 mb-12">Sube tus videos para procesarlos o revisarlos.</p>
      <UploadVideo />
    </div>
  );
};

export default UploadPage;
