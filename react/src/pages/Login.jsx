import { Button, Form, Input, Card } from "antd";
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import './Login.css'; 

export default function Login({ getName, getRoom, setLoading }) {
  const onFinish = (values) => {
    setLoading(true);
    getName(values.name);
    getRoom(values.room);
    setLoading(false);
  };

  return (
    <div className="login-container">
      <Card
        className="login-card"
        title="Join The Chat Room"
        hoverable
      >
        <Form
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="UserName"
            name="name"
            rules={[{ required: true, message: "Please Input Your Username" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Your Username" size="large" />
          </Form.Item>

          <Form.Item
            label="Room"
            name="room"
            rules={[{ required: true, message: "Please input your room number" }]}
          >
            <Input prefix={<TeamOutlined />} placeholder="Room Number" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Get into the chat room
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}