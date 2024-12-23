import { useEffect, useState, useRef } from "react";

const Video = ({ socket, video }) => {
    const [selectedVideo, setSelectedVideo] = useState(true);
    const [frames, setFrames] = useState([]); // Almacenar todos los frames recibidos
    const [metadata, setMetadata] = useState([]); // Almacenar toda la metadata recibida
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0); // Índice del frame actual
    const [isPlaying, setIsPlaying] = useState(true); // Estado de reproducción
    const intervalRef = useRef(null);

    useEffect(() => {
        if (selectedVideo) {
            setFrames([]); // Reinicia los frames
            setCurrentFrameIndex(0); // Reinicia el índice actual
            setIsPlaying(true); // Activa la reproducción automática
            socket.emit('process_video', { filename: video });
        }
    }, [selectedVideo, video, socket]);

    const handlePause = () => {
        setIsPlaying(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    const handlePlay = () => {
        setIsPlaying(true);
    };

    const handleNextFrame = () => {
        if (currentFrameIndex < frames.length - 1) {
            setCurrentFrameIndex(currentFrameIndex + 1);
        }
    };

    const handlePrevFrame = () => {
        if (currentFrameIndex > 0) {
            setCurrentFrameIndex(currentFrameIndex - 1);
        }
    };

    const handleSeek = (event) => {
        const targetFrameIndex = Math.floor(
            (event.target.value / 100) * (frames.length - 1)
        );
        setCurrentFrameIndex(targetFrameIndex);
    };

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setCurrentFrameIndex((prevIndex) =>
                    prevIndex < frames.length - 1 ? prevIndex + 1 : prevIndex
                );
            }, 100); // Ajusta el tiempo entre frames (en milisegundos)
        } else {
            clearInterval(intervalRef.current);
        }

        return () => {
            clearInterval(intervalRef.current);
        };
    }, [isPlaying, frames]);

    useEffect(() => {
        // Recibir frames desde el servidor
        socket.on('frame', (data) => {
            const base64Frame = `data:image/jpeg;base64,${btoa(
                new Uint8Array(data.frame).reduce((data, byte) => data + String.fromCharCode(byte), '')
            )}`;
            setFrames((prevFrames) => [...prevFrames, base64Frame]);
            setMetadata((prevMetadata) => [...prevMetadata, data.metadata]);
        });

        socket.on('end_of_video', () => {
            console.log('Video completo');
            setIsPlaying(false); // Detén la reproducción al finalizar el video
        });

        socket.on("error", (error) => {
            console.log(error);
        });

        return () => {
            socket.off('frame');
            socket.off('end_of_video');
        };
    }, [socket]);

    useEffect(() => {
        const keepAliveInterval = setInterval(() => {
            if (socket.connected) {
                socket.emit("keep_alive", { message: "Estoy vivo" });
            }
        }, 10000); // Cada 10 segundos

        return () => clearInterval(keepAliveInterval);
    }, [socket]);

    const currentMetadata = metadata[currentFrameIndex];

    const getDetectionCounts = (detections) => {
        const counts = {};
        detections.forEach((object) => {
            counts[object.label] = (counts[object.label] || 0) + 1;
        });
        return Object.entries(counts);
    };

    return (
        <div className="p-4 bg-white text-gray-800 rounded-lg shadow-lg">
            {selectedVideo && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Reproduciendo: {video}</h2>
                    {frames.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <img
                                    className="border border-gray-300 rounded-lg w-1/2"
                                    src={frames[currentFrameIndex]}
                                    alt="Current Frame"
                                />
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <button
                                    onClick={handlePrevFrame}
                                    disabled={currentFrameIndex === 0}
                                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 disabled:opacity-50"
                                >
                                    {"<<"}
                                </button>
                                <button
                                    onClick={handlePause}
                                    disabled={!isPlaying}
                                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 disabled:opacity-50"
                                >
                                    Pausa
                                </button>
                                <button
                                    onClick={handlePlay}
                                    disabled={isPlaying}
                                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 disabled:opacity-50"
                                >
                                    Play
                                </button>
                                <button
                                    onClick={handleNextFrame}
                                    disabled={currentFrameIndex >= frames.length - 1}
                                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 disabled:opacity-50"
                                >
                                    {">>"}
                                </button>
                            </div>
                            <div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={(currentFrameIndex / (frames.length - 1)) * 100 || 0}
                                    onChange={handleSeek}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <p>Frame: {currentMetadata?.frame_index || 0}</p>
                                <p>Tiempo: {currentMetadata?.frame_time?.toFixed(2) || 0}</p>
                                <p>Detecciones: {currentMetadata?.detections?.length || 0}</p>
                                <table className="table-auto w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="border border-gray-300 px-4 py-2">Objeto</th>
                                            <th className="border border-gray-300 px-4 py-2">Cantidad</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getDetectionCounts(currentMetadata?.detections || []).map(([label, count], index) => (
                                            <tr key={index} className="odd:bg-white even:bg-gray-100">
                                                <td className="border border-gray-300 px-4 py-2">{label}</td>
                                                <td className="border border-gray-300 px-4 py-2">{count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">Cargando...</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Video;
