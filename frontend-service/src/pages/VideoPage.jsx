import React from "react";
import { useParams } from "react-router-dom";
import Video from "./components/Video"; // Reutiliza el componente Video
import io from "socket.io-client"; // Si usas socket.io

const VideoPage = () => {
  const { idcam } = useParams(); // Obtiene el id de la cámara desde la URL

  // Configura el socket para la comunicación con el backend
  const socket = React.useMemo(() => {
    const serverUrl = `http://${import.meta.env.VITE_SERVER_URL}`; // Cambia esto según tu configuración
    return io(serverUrl, { transports: ["websocket"] });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white w-full">
      <h1 className="text-6xl font-bold text-gray-800 mb-16">Video Camara: {idcam}</h1>
      <Video socket={socket} video={idcam} /> {/* Pasa el socket y el idcam al componente Video */}
    </div>
  );
};

export default VideoPage;
