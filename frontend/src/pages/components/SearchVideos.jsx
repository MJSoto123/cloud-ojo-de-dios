import { useState, useEffect } from "react";
import axios from "axios";

const SERVER_URL = `http://${import.meta.env.VITE_SERVER_URL}/videos`;

const SearchVideos = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Realiza la petición al backend para obtener los videos
    axios
      .get(SERVER_URL)
      .then((response) => {
        setVideos(response.data); // Asigna los datos obtenidos a la lista de videos
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(`Error al obtener los videos: ${error}`);
        setVideos([]);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto px-80">
      {isLoading ? (
        <p className="text-center text-gray-600">Cargando cámaras...</p>
      ) : videos.length === 0 ? (
        <p className="text-center text-gray-600">No hay cámaras disponibles</p>
      ) : (
        <table className="min-w-full bg-white border-collapse">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold border-b">Nombre de la Cámara</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold border-b">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="px-6 py-4 text-gray-800 border-b">{video}</td>
                <td className="px-6 py-4 border-b">
                  <div className="flex space-x-4 justify-center">
                    <button
                      onClick={() => (window.location.href = `/cams/${video}/video`)}
                      className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    >
                      Video
                    </button>
                    <button
                      onClick={() => (window.location.href = `/cams/${video}/frame`)}
                      className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                    >
                      Frame
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SearchVideos;
