import React from "react";
import { useParams } from "react-router-dom";
import SearchFrame from "./components/SearchFrame";

const FramePage = () => {
  const { idcam } = useParams(); // Obtiene el id de la cámara desde la URL

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white w-full">
      <h1 className="text-6xl font-bold text-gray-800 mb-16">Frames de la Cámara: {idcam}</h1>
      <SearchFrame currentVideo={idcam} /> {/* Reutiliza el componente SearchFrame */}
    </div>
  );
};

export default FramePage;
