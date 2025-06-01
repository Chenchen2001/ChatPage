import { Button, Input, List, Avatar, message, Badge, Tooltip } from "antd";
import { useEffect, useState, useRef } from "react";
import {
  UserOutlined,
  ArrowLeftOutlined,
  SendOutlined,
} from "@ant-design/icons";
import "./Chat.css";
import { useNavigate } from "react-router-dom";

export default function Chat({ name, room, clearInfo, socket, setLoading }) {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;
    setLoading(true);
    // join room
    socket.emit("join-room", { room, name });
    // get room data
    socket.on("room-data", ({ users, messages }) => {
      setUsers(users);
      setMessages(messages);
      setLoading(false);
      scrollToBottom();
    });
    socket.on("new-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    // broadcast of user join
    socket.on("user-joined", (username) => {
      if (username !== name) {
        messageApi.info(`${username} Joined the room`, 2);
      }
    });

    // broadcast of user leave
    socket.on("user-left", (username) => {
      messageApi.info(`${username} Left the room`, 2);
    });

    return () => {
      socket.emit("leave-room");
      socket.off("room-data");
      socket.off("new-message");
      socket.off("user-joined");
      socket.off("user-left");
    };
  }, [socket, room, name, setLoading, messageApi]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    try {
      const trimmedMessage = messageInput.trim();
      if (!trimmedMessage) return;

      if (!socket || !socket.connected) {
        messageApi.error("Disconeected, please rejoin the room.");
        return;
      }

      socket.emit("send-message", trimmedMessage);
      setMessageInput("");
    } catch (error) {
      console.error("Failed to send:", error);
      messageApi.error("Failed to send text");
    }
  };

  const handleKeyPress = (e) => {
    try {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    } catch (error) {
      console.error("Keyboard event error:", error);
    }
  };

  const leaveRoom = () => {
    new Promise(() => {
      socket.emit("leave-room");
    }).then(() => {
      clearInfo();
      navigate("/login");
    });
  };

  const generateAvatarColor = (name) => {
    const colors = ["#7269ef", "#f56a00", "#87d068", "#1890ff", "#ff4d4f"];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  return (
    <div className="chat-container">
      {contextHolder}
      <div className="chat-header">
        <Tooltip title="Leave the room">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={leaveRoom}
            className="leave-button"
          />
        </Tooltip>
        <div className="room-info">
          <h2>{room}</h2>
          <Badge count={users.length} style={{ backgroundColor: "#7269ef" }} />
        </div>
      </div>

      <div className="message-container">
        <List
          dataSource={messages}
          renderItem={(item) => (
            <List.Item
              className={`message-item ${
                item.sender === name ? "own-message" : ""
              }`}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{
                      backgroundColor: generateAvatarColor(item.sender),
                    }}
                    icon={<UserOutlined />}
                  >
                    {item.sender?.charAt(0).toUpperCase()}
                  </Avatar>
                }
                title={
                  <div className="message-header">
                    <span className="sender-name">{item.sender}</span>
                    <span className="message-time">{item.time}</span>
                  </div>
                }
                description={<div className="message-content">{item.text}</div>}
              />
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>

      <div className="user-list">
        <h3>Users Online: ({users.length})</h3>
        <List
          size="small"
          dataSource={users}
          renderItem={(user) => (
            <List.Item>
              <Avatar
                size="small"
                style={{
                  backgroundColor: generateAvatarColor(user),
                  marginRight: 8,
                }}
              >
                {user?.charAt(0).toUpperCase()}
              </Avatar>
              {user}
              {user === name && <span className="you-badge">(You)</span>}
            </List.Item>
          )}
        />
      </div>

      <div className="message-input-container">
        <Input.TextArea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type in context..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          className="message-input"
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={sendMessage}
          className="send-button"
          disabled={!messageInput.trim()}
        />
      </div>
    </div>
  );
}
