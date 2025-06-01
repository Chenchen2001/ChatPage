import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import { useState } from "react";
import { socket } from './socket';
import { ConfigProvider, Spin } from "antd";
import './App.css';

export default function App() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(false);

  const getName = (name) => {
    setName(name);
  };

  const getRoom = (room) => {
    setRoom(room);
  };

  const clearInfo = () => {
    setName("")
    setRoom("")
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#7269ef',
          borderRadius: 8,
        },
      }}
    >
      <div className="app-container">
        {loading && (
          <div className="loading-overlay">
            <Spin size="large" />
          </div>
        )}
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                name && room ? (
                  <Navigate to="/chat" replace />
                ) : (
                  <Login getName={getName} getRoom={getRoom} setLoading={setLoading} />
                )
              }
            />
            <Route
              path="/chat"
              element={
                name && room ? (
                  <Chat name={name} room={room} clearInfo={clearInfo} socket={socket} setLoading={setLoading} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              index
              element={
                name && room ? (
                  <Navigate to="/chat" replace />
                ) : (
                  <Login getName={getName} getRoom={getRoom} setLoading={setLoading} />
                )
              }
            />
          </Routes>
        </BrowserRouter>
      </div>
    </ConfigProvider>
  );
}