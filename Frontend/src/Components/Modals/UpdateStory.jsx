import React, { useEffect, useState } from "react";
import {
  Modal,
  Upload,
  Input,
  Button,
  DatePicker,
  message,
  Select,
  Form,
  Slider,
  Typography,
  Card,
  Divider,
  Row,
  Col,
  Steps,
  Tag,
  Tooltip
} from "antd";
import { 
  UploadOutlined, 
  ClockCircleOutlined, 
  FireOutlined,
  CalendarOutlined,
  EditOutlined,
  TagOutlined,
  ExperimentOutlined,
  BulbOutlined,
  BookOutlined,
  RightOutlined,
  CheckCircleOutlined,
  PictureOutlined,
  DeleteOutlined
} from "@ant-design/icons";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import UploadFileService from "../../Services/UploadFileService";
import StoryService from "../../Services/StoryService";
import moment from "moment";

// Consistent color scheme with CreateStoryModal
const themeColors = {
  primary: "#20C997", // Vibrant teal as primary brand color
  secondary: "#38D9A9", // Lighter mint green for secondary elements
  accent: "#12B886", // Deeper green for accents and highlights
  background: "#F1FBF7", // Very light mint for general background
  surface: "#E6F8F1", // Soft light green for surface elements
  cardBg: "#FFFFFF", // White background for cards
  textPrimary: "#212529", // Dark charcoal for primary text
  textSecondary: "#495057", // Medium gray for secondary text
  border: "rgba(0, 0, 0, 0.12)", // Subtle neutral border
  hover: "#0CA678", // Slightly darker teal for hover effects
  danger: "#FF4D4F", // Red for warnings
  success: "#28A745", // Green for success messages
  gradient: "linear-gradient(135deg, #20C997 0%, #38D9A9 100%)", // Teal to mint gradient
};

const uploader = new UploadFileService();
const { Option } = Select;
const { Text, Title } = Typography;
const { Step } = Steps;

const UpdateStory = () => {
  const snap = useSnapshot(state);
  const workoutStory = snap.selectedWorkoutStory;
  const userId = snap.currentUser?.id;
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timestamp: null,
    exerciseType: "",
    timeDuration: 30,
    intensity: "",
    image: "",
    category: "Beginner"
  });

  useEffect(() => {
    if (workoutStory) {
      setFormData({
        title: workoutStory.title || "",
        description: workoutStory.description || "",
        timestamp: workoutStory.timestamp ? moment(workoutStory.timestamp) : null,
        exerciseType: workoutStory.exerciseType || "",
        timeDuration: workoutStory.timeDuration || 30,
        intensity: workoutStory.intensity || "",
        image: workoutStory.image || "",
        category: workoutStory.category || "Beginner"
      });
      
      form.setFieldsValue({
        title: workoutStory.title,
        description: workoutStory.description,
        timestamp: workoutStory.timestamp ? moment(workoutStory.timestamp) : null,
        exerciseType: workoutStory.exerciseType,
        timeDuration: workoutStory.timeDuration || 30,
        intensity: workoutStory.intensity,
        category: workoutStory.category || "Beginner"
      });
    }
  }, [workoutStory, form]);

  const handleUpdateStory = async () => {
    try {
      setLoading(true);
      const body = {
        ...formData,
        image: uploadedImage || workoutStory.image,
      };
      
      await StoryService.UpdateStory(workoutStory.id, body);
      state.storyCards = await StoryService.getAllWorkoutStories();
      message.success("Learning Plan updated successfully");
      
      // Reset steps and modal
      setCurrentStep(0);
      state.workoutStoryOpen = false;
    } catch (error) {
      message.error("Error updating Learning Plan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await StoryService.deleteWorkoutStory(workoutStory.id);
      state.storyCards = await StoryService.getAllWorkoutStories();
      state.workoutStoryOpen = false;
      message.success("Learning Plan deleted successfully");
    } catch (error) {
      message.error("Failed to delete Learning Plan");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFileChange = async (info) => {
    if (info.file) {
      setImageUploading(true);
      try {
        const url = await uploader.uploadFile(
          info.fileList[0].originFileObj,
          "workoutStories"
        );
        setUploadedImage(url);
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      timestamp: date,
    });
  };

  const handleIntensityChange = (value) => {
    setFormData({
      ...formData,
      intensity: value,
    });
  };

  const handleCategoryChange = (value) => {
    setFormData({
      ...formData,
      category: value,
    });
  };

  // Duration markers for slider
  const durationMarks = {
    0: '0',
    30: '30',
    60: '60',
    90: '90',
    120: '120'
  };

  // Function to get intensity color based on value
  const getIntensityColor = (intensity) => {
    switch(intensity) {
      case "No Efforts": return '#52c41a';
      case "Mid Efforts": return '#1890ff';
      case "Moderate Efforts": return '#faad14';
      case "Severe Efforts": return '#f5222d';
      case "Maximal Efforts": return '#722ed1';
      default: return themeColors.textSecondary;
    }
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 0:
        return (
          <div>
            <Title level={5} style={{ color: themeColors.primary, marginBottom: '16px' }}>
              Basic Information
            </Title>
            <Row gutter={24}>
              <Col span={16}>
                <Form.Item 
                  label={
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <EditOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
                      Title
                    </span>
                  } 
                  name="title" 
                  rules={[{ required: true, message: 'Please input a title' }]}
                >
                  <Input
                    placeholder="Enter plan title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item 
                  label={
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
                      Start Date
                    </span>
                  } 
                  name="timestamp"
                >
                  <DatePicker
                    placeholder="Select date"
                    style={{ width: "100%", borderRadius: '8px' }}
                    value={formData.timestamp}
                    onChange={handleDateChange}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item 
                  label={
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <TagOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
                      Learning Type
                    </span>
                  } 
                  name="exerciseType"
                >
                  <Input
                    placeholder="What type of learning?"
                    name="exerciseType"
                    value={formData.exerciseType}
                    onChange={handleInputChange}
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  label={
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <ExperimentOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
                      Category
                    </span>
                  } 
                  name="category"
                >
                  <Select
                    placeholder="Select category"
                    style={{ width: "100%", borderRadius: '8px' }}
                    value={formData.category}
                    onChange={handleCategoryChange}
                    dropdownStyle={{ borderRadius: '8px' }}
                  >
                    <Option value="Beginner">
                      <Tag color="green">Beginner</Tag>
                    </Option>
                    <Option value="Intermediate">
                      <Tag color="blue">Intermediate</Tag>
                    </Option>
                    <Option value="Advanced">
                      <Tag color="purple">Advanced</Tag>
                    </Option>
                    <Option value="Expert">
                      <Tag color="red">Expert</Tag>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item 
              label={
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <BulbOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
                  Description
                </span>
              } 
              name="description"
            >
              <Input.TextArea
                placeholder="Add some details about this learning plan..."
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
          </div>
        );
      case 1:
        return (
          <div>
            <Title level={5} style={{ color: themeColors.primary, marginBottom: '16px' }}>
              Learning Parameters
            </Title>
            
            <Form.Item 
              label={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <ClockCircleOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
                    Study Time
                  </span>
                  <Text 
                    strong 
                    style={{ 
                      color: formData.timeDuration > 60 ? '#f5222d' : formData.timeDuration > 30 ? '#faad14' : '#52c41a',
                    }}
                  >
                    {formData.timeDuration} minutes
                  </Text>
                </div>
              }
              name="timeDuration"
              style={{ marginBottom: 24 }}
            >
              <div style={{ 
                backgroundColor: themeColors.surface,
                padding: '24px 16px 8px',
                borderRadius: '12px',
                border: `1px solid ${themeColors.border}`,
              }}>
                <Slider
                  min={0}
                  max={120}
                  step={5}
                  value={formData.timeDuration}
                  marks={durationMarks}
                  tooltip={{ formatter: value => `${value} min` }}
                  trackStyle={{ backgroundColor: themeColors.primary }}
                  handleStyle={{ borderColor: themeColors.primary }}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      timeDuration: value,
                    });
                  }}
                />
              </div>
            </Form.Item>

            <Form.Item 
              label={
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <FireOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
                  Difficulty Level
                </span>
              } 
              name="intensity"
            >
              <div className="intensity-selection">
                <Row gutter={[12, 12]}>
                  {["No Efforts", "Mid Efforts", "Moderate Efforts", "Severe Efforts", "Maximal Efforts"].map((level) => (
                    <Col key={level} xs={12} md={8} lg={formData.intensity === level ? 8 : 4}>
                      <Card
                        onClick={() => handleIntensityChange(level)}
                        style={{ 
                          cursor: 'pointer',
                          borderRadius: '8px',
                          borderColor: formData.intensity === level ? getIntensityColor(level) : themeColors.border,
                          background: formData.intensity === level ? `${getIntensityColor(level)}10` : themeColors.cardBg,
                          transition: 'all 0.3s ease',
                          transform: formData.intensity === level ? 'scale(1.05)' : 'scale(1)',
                        }}
                        bodyStyle={{ padding: '10px' }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          justifyContent: 'center', 
                          flexDirection: 'column'
                        }}>
                          <FireOutlined style={{ 
                            fontSize: '18px', 
                            color: getIntensityColor(level),
                            marginBottom: '4px'
                          }} />
                          {formData.intensity === level ? (
                            <Text strong style={{ color: getIntensityColor(level), fontSize: '12px', textAlign: 'center' }}>
                              {level}
                            </Text>
                          ) : (
                            <Tooltip title={level}>
                              <div style={{ height: '16px', width: '16px', overflow: 'hidden' }}></div>
                            </Tooltip>
                          )}
                          {formData.intensity === level && (
                            <CheckCircleOutlined style={{ color: getIntensityColor(level), marginTop: '4px' }} />
                          )}
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </Form.Item>
          </div>
        );
      case 2:
        return (
          <div style={{ textAlign: 'center' }}>
            <Title level={5} style={{ color: themeColors.primary, marginBottom: '16px' }}>
              Plan Image
            </Title>
            
            {(uploadedImage || workoutStory?.image) ? (
              <div style={{ 
                borderRadius: '16px', 
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(119, 90, 218, 0.15)',
                marginBottom: '24px',
                position: 'relative'
              }}>
                <img
                  style={{ 
                    width: "100%", 
                    height: "280px",
                    objectFit: 'cover'
                  }}
                  src={uploadedImage || workoutStory?.image}
                  alt="Learning Plan"
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '40px 16px 16px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <Upload
                    accept="image/*"
                    onChange={handleFileChange}
                    showUploadList={false}
                    beforeUpload={() => false}
                  >
                    <Button 
                      icon={<UploadOutlined />} 
                      type="primary"
                      ghost
                      style={{ 
                        borderColor: 'white', 
                        color: 'white',
                        borderRadius: '8px'
                      }}
                    >
                      Change Image
                    </Button>
                  </Upload>
                </div>
              </div>
            ) : (
              <div style={{
                margin: '20px 0 30px',
                border: `2px dashed ${themeColors.border}`,
                borderRadius: '16px',
                padding: '60px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: themeColors.surface
              }}>
                {imageUploading ? (
                  <Text>Uploading image...</Text>
                ) : (
                  <Upload
                    accept="image/*"
                    onChange={handleFileChange}
                    showUploadList={false}
                    beforeUpload={() => false}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <PictureOutlined style={{ fontSize: '32px', color: themeColors.primary, marginBottom: '16px' }} />
                      <div>
                        <Text strong style={{ fontSize: '16px', color: themeColors.primary }}>Upload Plan Image</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '13px' }}>This will be displayed on your learning plan card</Text>
                      </div>
                      <Button
                        type="primary"
                        style={{
                          marginTop: '16px',
                          borderRadius: '8px',
                          background: themeColors.gradient,
                          border: 'none'
                        }}
                      >
                        Browse Images
                      </Button>
                    </div>
                  </Upload>
                )}
              </div>
            )}
            
            <Card style={{ 
              borderRadius: '12px', 
              borderColor: themeColors.border,
              background: themeColors.background
            }}>
              <div style={{ textAlign: 'left' }}>
                <Title level={5}>Plan Summary</Title>
                <Row gutter={[16, 8]}>
                  <Col span={8}><Text type="secondary">Title:</Text></Col>
                  <Col span={16}><Text strong>{formData.title || "Not specified"}</Text></Col>
                  
                  <Col span={8}><Text type="secondary">Type:</Text></Col>
                  <Col span={16}><Text>{formData.exerciseType || "Not specified"}</Text></Col>
                  
                  <Col span={8}><Text type="secondary">Duration:</Text></Col>
                  <Col span={16}>
                    <Text>{formData.timeDuration} minutes</Text>
                  </Col>
                  
                  <Col span={8}><Text type="secondary">Difficulty:</Text></Col>
                  <Col span={16}>
                    <Tag color={getIntensityColor(formData.intensity)}>
                      {formData.intensity || "Not specified"}
                    </Tag>
                  </Col>
                  
                  <Col span={8}><Text type="secondary">Category:</Text></Col>
                  <Col span={16}>
                    <Tag color={
                      formData.category === "Beginner" ? "green" :
                      formData.category === "Intermediate" ? "blue" :
                      formData.category === "Advanced" ? "purple" : "red"
                    }>
                      {formData.category}
                    </Tag>
                  </Col>
                </Row>
              </div>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  // Component for view-only mode (when user is not the owner)
  if (userId !== workoutStory?.userId) {
    return (
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 4,
              height: 24,
              background: themeColors.primary,
              marginRight: 12,
              borderRadius: 2
            }} />
            <Title level={4} style={{ margin: 0, color: themeColors.textPrimary }}>
              Learning Plan Details
            </Title>
          </div>
        }
        open={snap.workoutStoryOpen}
        onCancel={() => {
          state.workoutStoryOpen = false;
        }}
        width={550}
        bodyStyle={{ 
          padding: '24px', 
          backgroundColor: themeColors.background,
          borderRadius: '12px',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => (state.workoutStoryOpen = false)}
            style={{
              borderRadius: '8px',
            }}
          >
            Close
          </Button>
        ]}
        centered
      >
        <Card 
          bordered={false} 
          style={{ 
            background: themeColors.cardBg,
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(119, 90, 218, 0.12)'
          }}
        >
          <div style={{ 
            borderRadius: '12px', 
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            marginBottom: '20px'
          }}>
            <img 
              src={workoutStory?.image} 
              style={{ 
                width: '100%', 
                height: '200px', 
                objectFit: 'cover' 
              }} 
              alt="Learning Plan" 
            />
          </div>
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <div>
                <Text type="secondary">Title</Text>
                <div style={{ fontSize: '18px', fontWeight: 600, color: themeColors.textPrimary }}>{workoutStory?.title}</div>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <Text type="secondary">Start Date</Text>
                <div>{workoutStory?.timestamp ? moment(workoutStory.timestamp).format('YYYY-MM-DD') : 'N/A'}</div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text type="secondary">Learning Type</Text>
                <div style={{ fontWeight: 500 }}>{workoutStory?.exerciseType || 'N/A'}</div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text type="secondary">Category</Text>
                <div>
                  <Tag color={
                    workoutStory?.category === "Beginner" ? "green" :
                    workoutStory?.category === "Intermediate" ? "blue" :
                    workoutStory?.category === "Advanced" ? "purple" : "red"
                  }>
                    {workoutStory?.category || "Beginner"}
                  </Tag>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text type="secondary">Duration</Text>
                <div style={{ 
                  color: workoutStory?.timeDuration > 60 ? '#f5222d' : 
                         workoutStory?.timeDuration > 30 ? '#faad14' : '#52c41a',
                  fontWeight: 500
                }}>
                  <ClockCircleOutlined style={{ marginRight: '8px' }} />
                  {workoutStory?.timeDuration || 0} minutes
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text type="secondary">Difficulty Level</Text>
                <div>
                  <FireOutlined style={{ 
                    marginRight: '8px',
                    color: getIntensityColor(workoutStory?.intensity)
                  }} />
                  {workoutStory?.intensity || 'N/A'}
                </div>
              </div>
            </Col>
            <Col span={24}>
              <Divider style={{ margin: '8px 0', background: themeColors.border }} />
              <div>
                <Text type="secondary" style={{ display: 'flex', alignItems: 'center' }}>
                  <BulbOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
                  Description
                </Text>
                <div style={{ 
                  marginTop: '12px', 
                  padding: '12px', 
                  background: themeColors.surface,
                  borderRadius: '8px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {workoutStory?.description || 'No description provided.'}
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: 4,
            height: 24,
            background: themeColors.primary,
            marginRight: 12,
            borderRadius: 2
          }} />
          <Title level={4} style={{ margin: 0, color: themeColors.textPrimary }}>
            Update Learning Plan
          </Title>
        </div>
      }
      open={snap.workoutStoryOpen}
      onCancel={() => {
        state.workoutStoryOpen = false;
        setCurrentStep(0);
      }}
      width={700}
      bodyStyle={{ 
        padding: '24px', 
        backgroundColor: themeColors.background,
        borderRadius: '12px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}
      footer={null}
      centered
    >
      <Steps 
        current={currentStep}
        items={[
          {
            title: 'Basics',
            description: 'Plan details',
            icon: <BookOutlined />
          },
          {
            title: 'Parameters',
            description: 'Learning setup',
            icon: <BulbOutlined />
          },
          {
            title: 'Preview',
            description: 'Final touches',
            icon: <CheckCircleOutlined />
          }
        ]}
        style={{ marginBottom: '24px' }}
      />
      
      <Card 
        bordered={false} 
        style={{ 
          background: themeColors.cardBg,
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(119, 90, 218, 0.12)',
          maxHeight: '60vh',  // Limit height
          overflow: 'auto'    // Enable scrolling
        }}
      >
        <Form 
          form={form} 
          layout="vertical"
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px' 
          }}
        >
          {renderStepContent()}
          
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: '24px'
            }}
          >
            {currentStep > 0 ? (
              <Button 
                onClick={prevStep}
                style={{
                  borderRadius: '8px',
                }}
              >
                Back
              </Button>
            ) : (
              <Button 
                onClick={() => (state.workoutStoryOpen = false)}
                style={{
                  borderRadius: '8px',
                }}
              >
                Cancel
              </Button>
            )}
            
            {currentStep === 2 ? (
              <div>
                <Button
                  icon={<DeleteOutlined />}
                  loading={deleteLoading}
                  danger
                  onClick={handleDelete}
                  style={{ 
                    marginRight: '12px',
                    borderRadius: '8px'
                  }}
                >
                  Delete Plan
                </Button>
                <Button
                  loading={loading}
                  type="primary"
                  onClick={handleUpdateStory}
                  style={{
                    background: themeColors.gradient,
                    borderColor: themeColors.primary,
                    borderRadius: '8px',
                    boxShadow: "0 4px 12px rgba(119, 90, 218, 0.2)"
                  }}
                >
                  Update Learning Plan
                </Button>
              </div>
            ) : (
              <Button
                type="primary"
                onClick={nextStep}
                style={{
                  background: themeColors.gradient,
                  borderColor: themeColors.primary,
                  borderRadius: '8px',
                  boxShadow: "0 4px 12px rgba(119, 90, 218, 0.2)"
                }}
              >
                Next <RightOutlined />
              </Button>
            )}
          </div>
        </Form>
      </Card>
    </Modal>
  );
};

export default UpdateStory;