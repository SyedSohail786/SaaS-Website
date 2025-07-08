import { BrowserRouter, Route, Routes } from "react-router-dom";
import Auth from "./components/Auth";
import Dashboard from "../pages/Dashboard";
import PageNotFound from "./components/PageNotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={< Dashboard/>} />
        <Route path="auth" element={< Auth/>} />
        <Route path="*" element={<PageNotFound/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
