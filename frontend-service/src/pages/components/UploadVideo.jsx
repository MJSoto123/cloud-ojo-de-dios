import axios from "axios";
import { useState } from "react";

const UPLOAD_URL = `http://${import.meta.env.VITE_SERVER_URL}/upload`; // Asegúrate que esta URL sea válida

const UploadVideo = () => {
    const [videoFile, setVideoFile] = useState(null);

    const handleVideoChange = (e) => {
        const video = e.target.files[0];
        setVideoFile(video);
        console.log(video);
    }

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!videoFile) {
            console.log("No hay un video cargado");
            return;
        }
        const formData = new FormData();
        formData.append('video', videoFile);

        try {
            console.log(`Subiendo video ${videoFile.name}`);
            const response = await axios.post(
                UPLOAD_URL,
                formData,              
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            const data = response.data;
            console.log(data); 
        } catch (error) {
            console.log(`Error al subir el video: ${error}`);
        }
    }

    return (
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
            <form onSubmit={handleUpload} className="space-y-4">
                <input 
                    type="file" 
                    accept="video/*" 
                    onChange={handleVideoChange} 
                    className="w-full p-3 border border-gray-300 rounded-md text-gray-700"
                />
                <button 
                    type="submit" 
                    className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition duration-200"
                >
                    Subir Video
                </button>
            </form>
        </div>
    );
}

export default UploadVideo;
