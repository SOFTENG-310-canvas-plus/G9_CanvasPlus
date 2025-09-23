import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import UserLogin from "./auth/UserLogin.jsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
            <Routes>
                <Route path="/" element={<UserLogin />} />
                <Route path="/canvas-plus" elememt={<App/>} />
            </Routes>
      </BrowserRouter>
  </StrictMode>,
)
