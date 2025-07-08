import { BrowserRouter, Route, Routes } from "react-router-dom";
import Auth from "./components/Auth";
import Dashboard from "../pages/Dashboard";
import TextToSpeech from "./components/TextToSpeech";
import TextToImage from "./components/TextToImage";
import TextToVideo from "./components/TextToVideo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={< Dashboard/>} />
        <Route path="auth" element={< Auth/>} />
        <Route path="/text-to-speech" element={<TextToSpeech />} />
        <Route path="/text-to-image" element={<TextToImage />} />
        <Route path="/text-to-video" element={<TextToVideo />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
