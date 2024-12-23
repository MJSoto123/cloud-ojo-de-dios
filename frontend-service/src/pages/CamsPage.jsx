import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchVideos from './components/SearchVideos.jsx';

const CamsPage = () => {
  const [currentVideo, setCurrentVideo] = useState(null); // Guarda el video seleccionado
  const navigate = useNavigate();

  const handleVideoSelect = (video) => {
    setCurrentVideo(video); // Actualiza el video seleccionado
  };

  const navigateToPage = (type) => {
    if (currentVideo) {
      navigate(`/cams/${currentVideo}/${type}`); // Redirige según el tipo (video o frame)
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white w-full">
      <h1 className="text-6xl font-bold text-gray-800 mb-16">Lista de Cámaras</h1>
  
      <SearchVideos onVideoSelect={handleVideoSelect} /> {/* Maneja la selección del video */}
    </div>
  );
  
};

export default CamsPage;
