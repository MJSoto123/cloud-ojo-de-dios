import React from "react";
import { useNavigate } from "react-router-dom";
import CamaraImg from "../../public/assets/camara-seguridad.png";
import UploadImg from "../../public/assets/upload.png";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#ffffff]">
      <h1 className="text-6xl font-bold text-gray-800 mb-40 ">
        Bienvenido al Ojo de Dios
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Botón para Ver Cámaras */}
        <div
          className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate("/cams")}
        >
          <img
            src="https://static.vecteezy.com/system/resources/previews/016/016/734/non_2x/transparent-cctv-camera-icon-free-png.png"
            alt="Cámaras"
            className="w-32 h-32 mb-4 rounded-full shadow-lg transition-transform transform hover:scale-105"
          />

          <p className="text-lg font-semibold text-gray-700">Ver Cámaras</p>
        </div>

        {/* Botón para Subir Video */}
        <div
          className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate("/upload")}
        >
          <img
            src="https://static.vecteezy.com/system/resources/previews/015/337/675/non_2x/transparent-upload-icon-free-png.png"
            alt="Subir Video"
            className="w-32 h-32 mb-4 rounded-full shadow-lg transition-transform transform hover:scale-105"
          />
          <p className="text-lg font-semibold text-gray-700">Subir Video</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
