import { useState, useEffect, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import SplashScreen from "./components/SplashScreen.jsx";
import { AuthContext } from "./context/AuthContext.jsx";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { user } = useContext(AuthContext);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/chat" /> : <Home />} />
        <Route
          path="/chat"
          element={
            user ? (
              <ErrorBoundary>
                <ChatWindow />
              </ErrorBoundary>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        {/* /profile removed — profile is managed inside the chat UI now */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
