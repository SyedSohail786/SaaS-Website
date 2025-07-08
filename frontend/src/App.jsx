import { BrowserRouter, Route, Routes } from "react-router-dom";
import Auth from "./components/Auth";
import Dashboard from "../pages/Dashboard";
import PageNotFound from "./components/PageNotFound";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={< Dashboard/>} />
        <Route path="auth" element={< Auth/>} />
        <Route path="*" element={<PageNotFound/>} />
      </Routes>
    <Analytics />
    </BrowserRouter>
  );
}

export default App;
