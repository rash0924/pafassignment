import React, { useState } from "react";
import { Modal, Form, Input, Button, message, Space, Typography, Divider, Card } from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import MealPlanService from "../../Services/MealPlanService";
import { PlusOutlined, EditOutlined, CalendarOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const themeColors = {
  primary: "#20C997", // Vibrant teal as primary brand color
  secondary: "#38D9A9", // Lighter mint green for secondary elements
  accent: "#12B886", // Deeper green for accents and highlights
  background: "#F1FBF7", // Very light mint for general background
  surface: "#E6F8F1", // Soft light green for surface elements
  cardBg: "#FFFFFF", // White background for cards (unchanged)
  textPrimary: "#212529", // Dark charcoal for primary text
  textSecondary: "#495057", // Medium gray for secondary text
  border: "rgba(0, 0, 0, 0.12)", // Subtle neutral border (unchanged)
  hover: "#0CA678", // Slightly darker teal for hover effects
  danger: "#FF4D4F", // Maintained the same red for warnings
  success: "#28A745", // Kept the same green for success messages
  gradient: "linear-gradient(135deg, #20C997 0%, #38D9A9 100%)", // Teal to mint gradient
};

const CreateMealPlanModal = () => {
  const snap = useSnapshot(state);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Create Meal Plan data object
      const MealPlanData = {
        userId: snap.currentUser?.uid,
        planName: values.planName,
        description: values.description,
        goal: values.goal,
        routines: values.routines,
      };

      await MealPlanService.CreateMealPlanModal(MealPlanData);
      state.MealPlans = await MealPlanService.getAllMealPlans();
      
      // Success message
      message.success("Meal plan created successfully!");

      // Reset form and close modal
      form.resetFields();
      state.CreateMealPlanModalOpened = false;
    } catch (error) {
      console.error("Form validation failed:", error);
      
      // Error message
      message.error("Failed to create meal plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    state.CreateMealPlanModalOpened = false;
  };

  return (
    <Modal
      title={null}
      footer={null}
      visible={snap.CreateMealPlanModalOpened}
      onCancel={handleCancel}
      width={600}
      centered
      destroyOnClose
      bodyStyle={{ padding: "0" }}
      style={{ borderRadius: 16, overflow: "hidden" }}
    >
      <div style={{ 
        padding: "16px 24px", 
        background: themeColors.gradient,
        color: "white"
      }}>
        <Title level={4} style={{ margin: 0, color: "white" }}>
          <PlusOutlined style={{ marginRight: 8 }} />
          Create New Meal Plan
        </Title>
      </div>

      <div style={{ padding: "24px 24px 0 24px" }}>
        <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
          Design your personalized meal plan with workout routines to help you achieve your fitness goals.
        </Text>
      </div>

      {/* Form container with scrolling */}
      <div style={{ 
        padding: "0 24px 24px 24px",
        maxHeight: '65vh',  // Limit height
        overflow: 'auto'    // Enable scrolling
      }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Card
            style={{ 
              marginBottom: 24, 
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
            }}
            bodyStyle={{ padding: 16 }}
          >
            <Title level={5} style={{ marginTop: 0, display: "flex", alignItems: "center" }}>
              <EditOutlined style={{ marginRight: 8, color: themeColors.primary }} />
              Plan Details
            </Title>
            <Divider style={{ margin: "12px 0" }} />

            <Form.Item
              name="planName"
              label="Plan Name"
              rules={[{ required: true, message: "Please add a plan name" }]}
            >
              <Input 
                placeholder="Give your meal plan a name" 
                style={{ borderRadius: 8 }}
                size="large"
              />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: "Please enter description" }]}
            >
              <Input.TextArea 
                placeholder="Describe your meal plan goals and dietary preferences" 
                rows={3}
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
          </Card>

          <Card
            style={{ 
              marginBottom: 24, 
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
            }}
            bodyStyle={{ padding: 16 }}
          >
            <Title level={5} style={{ marginTop: 0, display: "flex", alignItems: "center" }}>
              <InfoCircleOutlined style={{ marginRight: 8, color: themeColors.primary }} />
              Nutrition Information
            </Title>
            <Divider style={{ margin: "12px 0" }} />
            
            <Form.Item
              name="goal"
              label="Meal Details"
              rules={[{ required: true, message: "Please enter meal details" }]}
            >
              <Input 
                placeholder="Enter meal details and nutrition information" 
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
          </Card>

          <Card
            style={{ 
              marginBottom: 24, 
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
            }}
            bodyStyle={{ padding: 16 }}
          >
            <Title level={5} style={{ marginTop: 0, display: "flex", alignItems: "center" }}>
              <CalendarOutlined style={{ marginRight: 8, color: themeColors.primary }} />
              Workout Schedule
            </Title>
            <Divider style={{ margin: "12px 0" }} />
            
            <Form.Item
              name="routines"
              label="Weekly Routine"
              rules={[{ required: true, message: "Please enter workout schedule" }]}
            >
              <Input.TextArea 
                placeholder="e.g. Monday: Cardio, Wednesday: Upper Body, Friday: Yoga" 
                rows={3}
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
          </Card>
          
          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button 
                onClick={handleCancel}
                style={{ 
                  borderRadius: 8, 
                  borderColor: themeColors.border,
                  paddingLeft: 20,
                  paddingRight: 20,
                  height: 40
                }}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                style={{
                  background: themeColors.primary,
                  borderColor: themeColors.primary,
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(32, 201, 151, 0.3)",
                  height: 40,
                  paddingLeft: 20,
                  paddingRight: 20
                }}
                size="large"
              >
                {loading ? "Creating..." : "Create Plan"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateMealPlanModal;