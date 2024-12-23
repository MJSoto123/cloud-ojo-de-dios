import React, { useState } from "react";
import axios from "axios";

const SEARCH_URL = `http://${import.meta.env.VITE_SERVER_URL}/videos/search`;
const GET_FRAME_URL = `http://${import.meta.env.VITE_SERVER_URL}/frame`;
const GET_IMAGE_URL = `http://${import.meta.env.VITE_SERVER_URL}/frame`;

let totalResults = 0;

const SearchFrame = ({ currentVideo }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [frameMetadata, setFrameMetadata] = useState(null);
  const [error, setError] = useState(null);
  const [frame, setFrame] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    setFrame(null);
    setFrameMetadata(null);
    try {
      const response = await axios.get(SEARCH_URL, {
        params: {
          video: currentVideo,
          object: query,
        },
      });
      setResults(response.data.matching_frames);
      totalResults = response.data.total_results;
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al buscar en la base de datos"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGetFrame = async (frameIndex) => {
    setLoading(true);
    setError(null);
    setFrameMetadata(null);
    setFrame(null);

    try {
      const response = await axios.get(GET_FRAME_URL, {
        params: {
          video: currentVideo,
          frame: frameIndex,
        },
      });
      setFrameMetadata(response.data);

      const imgResponse = await axios.get(
        `${GET_IMAGE_URL}${response.data.image_endpoint}`,
        { responseType: "blob" }
      );
      const imgUrl = URL.createObjectURL(imgResponse.data);
      setFrame(imgUrl);
    } catch (err) {
      setError(
        err.response?.data?.error || "Error al cargar el frame o la imagen"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white text-gray-800 rounded-lg shadow-lg space-y-4">
      <h2 className="text-lg font-semibold">Buscar objeto en {currentVideo}</h2>
      <form onSubmit={handleSearch} className="space-y-2">
        <div>
          <label className="block font-semibold">Objeto a Buscar:</label>
          <input
            className="w-full px-4 py-2 border rounded-lg"
            type="text"
            placeholder="Buscar (e.g., person, car)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Buscar
        </button>
      </form>

      {loading && <p className="text-gray-500">Cargando resultados...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {frame && (
        <div>
          <img
            src={frame}
            alt="Frame"
            className="border rounded-lg w-1/2 mx-auto"
          />
          {frameMetadata && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p>
                <strong>Frame:</strong> {frameMetadata.metadata.frame_index}
              </p>
              <p>
                <strong>Momento:</strong>{" "}
                {frameMetadata.metadata.frame_time.toFixed(2)} s
              </p>
              <p>
                <strong>Ruta de la Imagen:</strong>{" "}
                {frameMetadata.metadata.image_path}
              </p>
            </div>
          )}
        </div>
      )}

      {results.length > 0 && (
        <div>
          <h3 className="font-semibold">Resultados: {totalResults}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                <button
                  onClick={() => handleGetFrame(result.frame_index)}
                  className="block w-full text-left"
                >
                  <p>
                    <strong>Frame Index:</strong> {result.frame_index}
                  </p>
                  <p>
                    <strong>Tiempo:</strong> {result.frame_time.toFixed(2)} s
                  </p>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && !loading && !error && (
        <p className="text-gray-500">No hay resultados.</p>
      )}
    </div>
  );
};

export default SearchFrame;
