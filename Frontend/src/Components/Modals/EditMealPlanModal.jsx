import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Space, Typography, message } from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import MealPlanService from "../../Services/MealPlanService";

const { TextArea } = Input;
const { Title } = Typography;

// Theme colors from your existing component
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
  gradient: "linear-gradient(135deg, #20C997 0%, #38D9A9 100%)", // Teal to mint gradient
};

const EditMealPlanModal = () => {
  const snap = useSnapshot(state);
  const selectedPlan = snap.selectedMealPlan;
  const [updateLoading, setUpdateLoading] = useState(false);
  const [form] = Form.useForm();

  // Reset form fields when selected plan changes
  useEffect(() => {
    if (selectedPlan && form) {
      form.setFieldsValue({
        planName: selectedPlan.planName,
        description: selectedPlan.description,
        routines: selectedPlan.routines,
        goal: selectedPlan.goal,
      });
    }
  }, [selectedPlan, form]);

  const updateMealPlan = async (values) => {
    try {
      setUpdateLoading(true);
      // Prepare data for update
      const body = { 
        ...values, 
        userId: snap.currentUser?.uid,
        lastUpdated: new Date().toISOString().split('T')[0],
        // Preserve existing values for fields we're not updating
        category: selectedPlan.category,
        completedItems: selectedPlan.completedItems,
        totalItems: selectedPlan.totalItems
      };
      
      await MealPlanService.updateMealPlan(selectedPlan.id, body);
      
      // Update the state without page refresh
      const updatedPlans = await MealPlanService.getAllMealPlans();
      state.MealPlans = updatedPlans;
      
      // Update the selected plan in state with new values
      const updatedPlan = updatedPlans.find(plan => plan.id === selectedPlan.id);
      if (updatedPlan) {
        state.selectedMealPlan = updatedPlan;
      }
      
      // Close the modal
      state.editMealPlanOpened = false;
      
      // Success message
      message.success("Meal plan updated successfully!");
    } catch (error) {
      console.error("Failed to update meal plan:", error);
      
      // Error message
      message.error("Failed to update meal plan. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <Modal
      title={<Title level={4} style={{ color: themeColors.textPrimary }}>Edit Meal Plan</Title>}
      open={snap.editMealPlanOpened}
      onCancel={() => {
        state.editMealPlanOpened = false;
        form.resetFields();
      }}
      footer={null}
      destroyOnClose={true}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={updateMealPlan}
        initialValues={{
          planName: selectedPlan?.planName || "",
          description: selectedPlan?.description || "",
          routines: selectedPlan?.routines || "",
          goal: selectedPlan?.goal || "",
        }}
      >
        <Form.Item
          name="planName"
          label="Plan Name"
          rules={[{ required: true, message: "Please enter a plan name" }]}
        >
          <Input 
            placeholder="Enter plan name" 
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea 
            placeholder="Describe your meal plan goals and dietary preferences" 
            autoSize={{ minRows: 3, maxRows: 6 }}
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item
          name="routines"
          label="Workout Schedule (comma separated)"
        >
          <Input 
            placeholder="e.g. Monday: Cardio, Wednesday: Upper Body, Friday: Yoga" 
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item
          name="goal"
          label="Meal Details"
        >
          <TextArea 
            placeholder="Enter meal details and nutrition information" 
            autoSize={{ minRows: 2, maxRows: 4 }}
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item style={{ marginTop: 16 }}>
          <Space style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button 
              onClick={() => {
                state.editMealPlanOpened = false;
                form.resetFields();
              }}
              style={{ 
                borderRadius: 8, 
                borderColor: themeColors.primary,
              }}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={updateLoading}
              style={{
                background: themeColors.primary,
                borderColor: themeColors.primary,
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(255, 107, 53, 0.2)"
              }}
            >
              Update Plan
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditMealPlanModal;