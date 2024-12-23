import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CamsPage from "./pages/CamsPage";
import UploadPage from "./pages/UploadPage";
import VideoPage from "./pages/VideoPage";
import FramePage from "./pages/FramePage";
import './index.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cams" element={<CamsPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/cams/:idcam/video" element={<VideoPage />} />
        <Route path="/cams/:idcam/frame" element={<FramePage />} />
      </Routes>
    </Router>
  );
};

export default App;
