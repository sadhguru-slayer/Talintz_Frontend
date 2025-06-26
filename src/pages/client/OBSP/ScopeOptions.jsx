import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { 
  Form, Select, Radio, Checkbox, Input, InputNumber, Typography, 
  Card, Button, Divider, Tag, Space, Alert, Progress, Steps,
  Result, Avatar, Tooltip, Badge, Row, Col
} from 'antd';
import { 
  ShoppingCartOutlined, DollarOutlined, ClockCircleOutlined,
  CheckCircleOutlined, PlusOutlined, MinusOutlined,
  InfoCircleOutlined, WarningOutlined, RocketOutlined, 
  ShoppingOutlined, ArrowRightOutlined, ArrowLeftOutlined,
  HeartOutlined, StarOutlined, GiftOutlined, SafetyOutlined,
  TeamOutlined, BulbOutlined, CrownOutlined, UserOutlined,
  GlobalOutlined, ShoppingOutlined as ShoppingBagOutlined, FileTextOutlined,
  BgColorsOutlined, MobileOutlined, CreditCardOutlined,
  BellOutlined, BarChartOutlined, MessageOutlined,
  MailOutlined, SearchOutlined, ToolOutlined, EyeOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import OBSPDynamicForm from './OBSPDynamicForm';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const ScopeOptions = ({ 
  onCancel, 
  onConfirm, 
  selectedLevel = 'easy',
  initialPrice = 25000,
  obspPhases = [],
  obspId = null,
  selectedLevelData = null,
  draftResponseData = null
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [totalPrice, setTotalPrice] = useState(initialPrice);
  const [isCompleted, setIsCompleted] = useState(false);
  const [dynamicFormData, setDynamicFormData] = useState({});
  const [draftData, setDraftData] = useState(null);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  
  // Use ref to prevent infinite loops
  const draftLoadedRef = useRef(false);

  // Load draft data only once when component mounts
  useEffect(() => {
    if (draftResponseData && !draftLoadedRef.current) {
      console.log('Loading draft data into ScopeOptions:', draftResponseData);
      
      // Convert backend format to frontend format
      const convertedPhaseData = {};
      const allFormData = {};
      
      if (draftResponseData.phase_data) {
        // Use the phase_data if available
        Object.entries(draftResponseData.phase_data).forEach(([phaseKey, phaseInfo]) => {
          convertedPhaseData[phaseKey] = {
            responses: phaseInfo.responses || {},
            phaseImpacts: phaseInfo.phaseImpacts || {}
          };
          
          // Add to all form data
          Object.assign(allFormData, phaseInfo.responses || {});
        });
      } else if (draftResponseData.detailed_responses?.phases) {
        // Convert from detailed_responses format
        Object.entries(draftResponseData.detailed_responses.phases).forEach(([phaseKey, phaseInfo]) => {
          const phaseResponses = {};
          const phaseImpacts = {};
          
          // Extract selections from the backend format
          phaseInfo.selections?.forEach(selection => {
            const fieldId = selection.field_id;
            const selectedValue = selection.selected_value;
            const priceImpact = selection.price_impact || 0;
            
            if (fieldId && selectedValue !== undefined) {
              phaseResponses[fieldId] = selectedValue;
              if (priceImpact > 0) {
                phaseImpacts[fieldId] = priceImpact;
              }
            }
          });
          
          convertedPhaseData[phaseKey] = {
            responses: phaseResponses,
            phaseImpacts: { [phaseKey]: phaseInfo.phase_total || 0 }
          };
          
          // Add to all form data
          Object.assign(allFormData, phaseResponses);
        });
      }
      
      // Set the converted data
      setDynamicFormData(convertedPhaseData);
      
      // Also set the draft data for the dynamic form
      setDraftData({
        has_draft: true,
        draft_id: draftResponseData.draft_id,
        draft_price: draftResponseData.total_price,
        responses: allFormData
      });
      
      // Mark as loaded to prevent re-loading
      draftLoadedRef.current = true;
      setIsDraftLoaded(true);
    }
  }, [draftResponseData]);

  // Extract draft data from obspPhases only once
  useEffect(() => {
    if (obspPhases && obspPhases.length > 0 && !draftLoadedRef.current) {
      // Check if there's draft data in the API response
      const draftInfo = obspPhases.find(phase => phase.draft_data);
      if (draftInfo && draftInfo.draft_data && draftInfo.draft_data.has_draft) {
        setDraftData(draftInfo.draft_data);
        draftLoadedRef.current = true;
        setIsDraftLoaded(true);
      }
    }
  }, [obspPhases]);

  // Use actual level data instead of hardcoded configs
  const currentLevel = useMemo(() => {
    if (selectedLevelData) {
      return {
        name: selectedLevelData.name || `Level ${selectedLevel}`,
        basePrice: selectedLevelData.price || initialPrice,
        range: `₹${(selectedLevelData.price || initialPrice).toLocaleString()}`,
        color: selectedLevel === 'easy' ? "#22C55E" : selectedLevel === 'medium' ? "#F97316" : "#EF4444",
        gradient: selectedLevel === 'easy' ? "from-green-400 to-green-600" : 
                  selectedLevel === 'medium' ? "from-orange-400 to-orange-600" : 
                  "from-red-400 to-red-600",
        icon: selectedLevel === 'easy' ? <RocketOutlined /> : 
              selectedLevel === 'medium' ? <CrownOutlined /> : 
              <StarOutlined />,
        description: selectedLevelData.description || "Custom package for your needs"
      };
    }
    
    // Fallback to hardcoded configs if no level data
    const levelConfigs = {
    easy: {
      name: "Basic E-commerce",
        basePrice: initialPrice,
        range: `₹${initialPrice.toLocaleString()}`,
      color: "#22C55E",
      gradient: "from-green-400 to-green-600",
      icon: <RocketOutlined />,
      description: "Perfect for startups and small businesses"
    },
    medium: {
      name: "Advanced E-commerce", 
        basePrice: initialPrice,
        range: `₹${initialPrice.toLocaleString()}`,
      color: "#F97316",
      gradient: "from-orange-400 to-orange-600",
      icon: <CrownOutlined />,
      description: "Ideal for growing businesses with advanced needs"
    },
    hard: {
      name: "Enterprise E-commerce",
        basePrice: initialPrice,
        range: `₹${initialPrice.toLocaleString()}`,
      color: "#EF4444",
      gradient: "from-red-400 to-red-600",
      icon: <StarOutlined />,
      description: "For large-scale operations and enterprises"
    }
    };
    
    return levelConfigs[selectedLevel] || levelConfigs.easy;
  }, [selectedLevel, selectedLevelData, initialPrice]);

  // Get phase icon - MOVED BEFORE useMemo
  const getPhaseIcon = useCallback((phase) => {
    const icons = {
      'basic': <UserOutlined />,
      'core_features': <CheckCircleOutlined />,
      'add_ons': <PlusOutlined />,
      'review': <ShoppingOutlined />,
      'preview': <EyeOutlined />
    };
    return icons[phase] || <UserOutlined />;
  }, []);

  // Create dynamic steps based on backend phases + preview - FIXED LOGIC
  const steps = useMemo(() => {
    
    // Add null check for obspPhases
    if (!obspPhases || !Array.isArray(obspPhases) || obspPhases.length === 0) {
      return [{
        title: 'Preview & Purchase',
        description: 'Review your configuration',
        icon: <EyeOutlined />,
        phase: 'preview'
      }];
    }

    const phaseSteps = obspPhases.map((phase, index) => {
      return {
        title: phase.phase_display || `Phase ${index + 1}`,
        description: phase.phase_description || `Step ${index + 1}`,
        icon: getPhaseIcon(phase.phase),
        phase: phase.phase
      };
    });
    
    // Add preview step at the end
    const previewStep = {
      title: 'Preview & Purchase',
      description: 'Review your configuration',
      icon: <EyeOutlined />,
      phase: 'preview'
    };

    const allSteps = [...phaseSteps, previewStep];
    console.log('Final steps created:', allSteps);
    return allSteps;
  }, [obspPhases, getPhaseIcon]);

  // NEW: Set initial step to preview if draft exists
  useEffect(() => {
    if (draftResponseData && steps.length > 0) {
      // Set current step to the last step (preview) when draft exists
      setCurrentStep(steps.length - 1);
      console.log('Draft detected, setting current step to preview:', steps.length - 1);
    }
  }, [draftResponseData, steps.length]);

  // Handle option changes
  const handleOptionChange = useCallback((key, value) => {
    const newSelections = { ...selectedOptions, [key]: value };
    setSelectedOptions(newSelections);
  }, [selectedOptions]);

  // Get all responses from all phases for form initialization
  const getAllResponses = useCallback(() => {
    const allResponses = {};
    Object.values(dynamicFormData).forEach(data => {
      if (data.responses) {
        Object.assign(allResponses, data.responses);
      }
    });
    return allResponses;
  }, [dynamicFormData]);

  // Debounced form data update to prevent excessive re-renders
  const debouncedSetDynamicFormData = useCallback(
    (() => {
      let timeoutId;
      return (newData) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setDynamicFormData(newData);
        }, 300);
      };
    })(),
    []
  );

  // Render dynamic phase content - FIXED TO SHOW ALL PHASES PROPERLY
  const renderPhaseContent = useCallback((phase) => {
    
    if (phase.phase === 'preview') {
      return renderPreview();
    }

    // Add null check for obspPhases
    if (!obspPhases || !Array.isArray(obspPhases)) {
      return (
        <div>
          <Card className="bg-gradient-to-br from-white/5 to-white/3 border border-white/10 shadow-xl">
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-client-accent mx-auto mb-4"></div>
              <Text className="text-text-light/50">Loading phases...</Text>
            </div>
          </Card>
        </div>
      );
    }

    // Find the phase data from backend
    const phaseData = obspPhases.find(p => p.phase === phase.phase);
    
    if (!phaseData || !phaseData.fields || phaseData.fields.length === 0) {
      return (
        <div>
          <Card className="bg-gradient-to-br from-white/5 to-white/3 border border-white/10 shadow-xl">
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                {getPhaseIcon(phase.phase)}
              </div>
              <Title level={3} className="!text-text-light mb-2">{phase.title}</Title>
              <Text className="text-text-secondary">{phase.description}</Text>
              <Alert
                message="No fields configured for this phase"
                description="This phase doesn't have any custom fields configured yet."
                type="info"
                showIcon
                className="mt-6"
              />
            </div>
          </Card>
        </div>
      );
    }

    const allResponses = getAllResponses();

    // Convert draft data to the format expected by OBSPDynamicForm
    const preFilledData = {};
    if (draftResponseData && isDraftLoaded) {
      if (draftResponseData.form_data) {
        // Use form_data if available
        Object.assign(preFilledData, draftResponseData.form_data);
      } else if (draftResponseData.detailed_responses?.phases) {
        // Convert from detailed_responses format
        Object.values(draftResponseData.detailed_responses.phases).forEach(phaseInfo => {
          phaseInfo.selections?.forEach(selection => {
            if (selection.field_id && selection.selected_value !== undefined) {
              preFilledData[selection.field_id] = selection.selected_value;
            }
          });
        });
      }
    }

    return (
      <div>
        <OBSPDynamicForm
          phases={[phaseData]}
          onValuesChange={(data) => {
            debouncedSetDynamicFormData(prev => {
              const newData = {
                ...prev,
                [phase.phase]: data
              };
              return newData;
            });
          }}
          selectedLevel={selectedLevel}
          basePrice={currentLevel.basePrice}
          initialValues={allResponses}
          draftData={phaseData.draft_data}
          preFilledData={preFilledData}  // Pass converted draft data
        />
      </div>
    );
  }, [obspPhases, getPhaseIcon, getAllResponses, draftResponseData, isDraftLoaded, selectedLevel, currentLevel.basePrice, debouncedSetDynamicFormData]);

  const renderPreview = useCallback(() => {
    // Calculate total price correctly using currentLevel.basePrice
    const totalPhaseImpacts = Object.values(dynamicFormData).reduce((total, data) => {
      if (data.phaseImpacts && typeof data.phaseImpacts === 'object') {
        return total + Object.values(data.phaseImpacts).reduce((sum, impact) => sum + (impact || 0), 0);
      }
      return total;
    }, 0);
    
    const totalPrice = currentLevel.basePrice + totalPhaseImpacts;

    
    return (
      <div>
        <Card className="bg-gradient-to-br from-white/5 to-white/3 border border-white/10 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-client-accent flex items-center justify-center">
              <EyeOutlined className="text-2xl text-white" />
            </div>
            <Title level={3} className="!text-text-light mb-2">Review Your Configuration</Title>
            <Text className="text-text-secondary">Everything looks perfect! Ready to proceed?</Text>
          </div>
          
          <div className="space-y-6">
            {/* Package Summary */}
            <div className="bg-gradient-to-r from-client-accent/10 to-client-secondary/10 rounded-xl p-6 border border-client-accent/20">
              <div className="flex items-center justify-between">
                <div>
                  <Title level={4} className="!text-text-light mb-1">{currentLevel.name}</Title>
                  <Text className="text-text-secondary">{currentLevel.description}</Text>
                </div>
                <div className="text-right">
                  <div className="text-client-accent font-bold text-2xl">₹{currentLevel.basePrice.toLocaleString()}</div>
                  <div className="text-text-secondary text-sm">Base Package</div>
                </div>
              </div>
            </div>

            {/* Phase-wise Summary - ADDED NULL CHECK */}
            {obspPhases && Array.isArray(obspPhases) && obspPhases.map((phase, index) => {
              const phaseData = dynamicFormData[phase.phase];
              const phaseResponses = phaseData?.responses || {};
              const phaseImpact = phaseData?.phaseImpacts?.[phase.phase] || 0;
              
              if (Object.keys(phaseResponses).length === 0) {
                return null;
              }

              return (
                <div key={phase.phase} className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-client-accent/20 flex items-center justify-center">
                        {getPhaseIcon(phase.phase)}
                        </div>
                        <div>
                        <Title level={5} className="!text-text-light mb-0">{phase.phase_display}</Title>
                        <Text className="text-text-secondary text-sm">{phase.phase_description}</Text>
                      </div>
                    </div>
                    {phaseImpact > 0 && (
                      <div className="text-right">
                        <Tag color="blue" size="large" className="text-sm font-semibold">
                          +₹{phaseImpact.toLocaleString()}
                        </Tag>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(phaseResponses).map(([fieldId, response]) => {
                      const field = phase.fields?.find(f => f.id == fieldId);
                      const fieldLabel = field?.label || `Field ${fieldId}`;
                      
                      return (
                        <div key={fieldId} className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <Text className="text-text-secondary text-xs font-medium uppercase tracking-wide mb-1">
                            {fieldLabel}
                          </Text>
                          <div className="text-text-light font-medium">
                            {Array.isArray(response) ? response.join(', ') : response}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Price Summary */}
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-6 border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <Title level={4} className="!text-text-light mb-1">Total Investment</Title>
                  <Text className="text-text-secondary">One-time payment, no hidden fees</Text>
                </div>
                <div className="text-right">
                  <div className="text-client-accent font-bold text-3xl">₹{totalPrice.toLocaleString()}</div>
                  <div className="text-text-secondary text-sm">Includes all features</div>
                </div>
              </div>
              
              {/* Price Breakdown */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Text className="text-text-secondary">Base Package</Text>
                    <Text className="text-text-light">₹{currentLevel.basePrice.toLocaleString()}</Text>
                  </div>
                  {totalPhaseImpacts > 0 && (
                    <div className="flex justify-between items-center">
                      <Text className="text-text-secondary">Additional Features</Text>
                      <Text className="text-client-accent font-medium">+₹{totalPhaseImpacts.toLocaleString()}</Text>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }, [dynamicFormData, currentLevel, getAllResponses, obspPhases, getPhaseIcon]);

  const renderStepContent = useCallback(() => {
    
    if (currentStep >= steps.length) return null;
    
    const currentPhase = steps[currentStep];
    return renderPhaseContent(currentPhase);
  }, [currentStep, steps, renderPhaseContent]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, steps.length]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    const totalPhaseImpacts = Object.values(dynamicFormData).reduce((total, data) => {
      if (data.phaseImpacts && typeof data.phaseImpacts === 'object') {
        return total + Object.values(data.phaseImpacts).reduce((sum, impact) => sum + (impact || 0), 0);
      }
      return total;
    }, 0);
    
      const formData = {
        selectedOptions,
      totalPrice: currentLevel.basePrice + totalPhaseImpacts,
      dynamicResponses: Object.values(dynamicFormData).reduce((all, data) => ({ ...all, ...data.responses }), {}),
      selectedLevel,
      phaseData: dynamicFormData,
      draftId: draftData?.draft_id || null // Include draft ID if exists
      };
      onConfirm(formData, true);
  }, [dynamicFormData, selectedOptions, currentLevel.basePrice, selectedLevel, draftData, onConfirm]);

  if (isCompleted) {
    return (
      <Result
        status="success"
        icon={<CheckCircleOutlined className="text-6xl text-green-500" />}
        title="Configuration Complete!"
        subTitle="Your e-commerce package has been customized perfectly. Redirecting to purchase..."
        className="text-center"
      />
    );
  }

  return (
    <div className="min-h-screen rounded-lg bg-gradient-to-br from-client-primary via-client-primary to-client-secondary p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-client-accent flex items-center justify-center shadow-2xl">
              <ShoppingCartOutlined className="text-3xl text-white" />
            </div>
            <Title level={2} className="!text-text-light mb-2">
              Customize Your {currentLevel.name} Experience
            </Title>
            <Text className="text-text-secondary text-lg">
              Let's build something amazing together. We'll guide you through every step.
            </Text>
          </motion.div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <Steps 
            current={currentStep} 
            className="custom-steps"
            items={steps}
          />
        </div>

        {/* Debug Info - REMOVE THIS AFTER FIXING */}
        <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <Text className="text-yellow-500 text-sm">
            Debug: Current Step: {currentStep}, Total Steps: {steps.length}, 
            obspPhases: {obspPhases ? obspPhases.length : 'null'}, 
            Current Phase: {steps[currentStep]?.phase}, 
            Draft Data: {draftResponseData ? 'Yes' : 'No'}
          </Text>
        </div>

        {/* Main Content and Price Summary */}
        <div className="space-y-6">
          {/* Main Content */}
          <div>
          {renderStepContent()}
          </div>

          {/* Price Summary - Compact & Informative - ADDED NULL CHECK */}
          {currentStep !== steps.length - 1 && (
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-6 border border-green-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCartOutlined className="text-client-accent" />
                  <Title level={5} className="!text-text-light mb-0">Price Summary</Title>
                </div>
                <div className="text-right">
                  <Text className="text-client-accent font-bold text-2xl">₹{(() => {
                    const basePrice = currentLevel.basePrice;
                    const totalPhaseImpacts = Object.values(dynamicFormData).reduce((total, data) => {
                      if (data.phaseImpacts && typeof data.phaseImpacts === 'object') {
                        return total + Object.values(data.phaseImpacts).reduce((sum, impact) => sum + (impact || 0), 0);
                      }
                      return total;
                    }, 0);
                    return (basePrice + totalPhaseImpacts).toLocaleString();
                  })()}</Text>
                  <div className="text-text-secondary text-xs">Total Investment</div>
                </div>
              </div>
              
              {/* Compact Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Base Price */}
                <div className="bg-white/5 rounded p-3 border border-white/10">
                  <Text className="text-text-secondary text-xs block mb-1">Base Package</Text>
                  <Text className="text-text-light font-medium">₹{currentLevel.basePrice.toLocaleString()}</Text>
                </div>

                {/* Phase Impacts - Only show if there are impacts - ADDED NULL CHECK */}
                {(() => {
                  if (!obspPhases || !Array.isArray(obspPhases)) {
                    return (
                      <div className="bg-white/5 rounded p-3 border border-white/10 col-span-2 md:col-span-3">
                        <Text className="text-text-secondary text-xs block mb-1">Additional Features</Text>
                        <Text className="text-text-light text-sm">Loading...</Text>
                      </div>
                    );
                  }

                  const phasesWithImpacts = obspPhases.filter((phase, index) => {
                    const phaseData = dynamicFormData[phase.phase];
                    const phaseImpact = phaseData?.phaseImpacts?.[phase.phase];
                    return phaseImpact && phaseImpact > 0;
                  });

                  if (phasesWithImpacts.length === 0) {
                    return (
                      <div className="bg-white/5 rounded p-3 border border-white/10 col-span-2 md:col-span-3">
                        <Text className="text-text-secondary text-xs block mb-1">Additional Features</Text>
                        <Text className="text-text-light text-sm">No custom features selected</Text>
                      </div>
                    );
                  }

                  return phasesWithImpacts.map((phase, index) => {
                    const phaseData = dynamicFormData[phase.phase];
                    const phaseImpact = phaseData?.phaseImpacts?.[phase.phase];
                    
                    return (
                      <div key={phase.phase} className="bg-white/5 rounded p-3 border border-white/10">
                        <Text className="text-text-secondary text-xs block mb-1">{phase.phase_display}</Text>
                        <Text className="text-client-accent font-medium">+₹{phaseImpact.toLocaleString()}</Text>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Simple Calculation Line */}
              {(() => {
                const basePrice = currentLevel.basePrice;
                const phaseImpacts = Object.values(dynamicFormData)
                  .filter(data => data.phaseImpacts && Object.keys(data.phaseImpacts).length > 0)
                  .flatMap(data => Object.values(data.phaseImpacts))
                  .filter(impact => impact > 0);
                
                if (phaseImpacts.length > 0) {
                  return (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <Text className="text-text-secondary text-xs">
                        ₹{basePrice.toLocaleString()} + {phaseImpacts.map(impact => `₹${impact.toLocaleString()}`).join(' + ')} = ₹{(basePrice + phaseImpacts.reduce((sum, impact) => sum + impact, 0)).toLocaleString()}
                      </Text>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            type="default"
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="bg-white/10 hover:bg-white/20 border-white/20 text-text-light px-8"
          >
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              type="primary"
              size="large"
              icon={<ShoppingOutlined />}
              onClick={handleComplete}
              className="bg-gradient-to-r from-client-accent to-client-accent/90 text-white border-none shadow-lg hover:shadow-xl px-8"
            >
              Complete Purchase - ₹{(() => {
                const totalPhaseImpacts = Object.values(dynamicFormData).reduce((total, data) => {
                  if (data.phaseImpacts && typeof data.phaseImpacts === 'object') {
                    return total + Object.values(data.phaseImpacts).reduce((sum, impact) => sum + (impact || 0), 0);
                  }
                  return total;
                }, 0);
                return (currentLevel.basePrice + totalPhaseImpacts).toLocaleString();
              })()}
            </Button>
          ) : (
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={handleNext}
              className="bg-gradient-to-r from-client-accent to-client-accent/90 text-white border-none shadow-lg hover:shadow-xl px-8"
            >
              Next Step
            </Button>
          )}
        </div>

        {/* Enhanced CSS Styles */}
        <style jsx global>{`
          .custom-input {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: var(--text-light) !important;
            border-radius: 8px !important;
          }
          
          .custom-input:focus {
            border-color: var(--client-accent) !important;
            box-shadow: 0 0 0 2px rgba(0, 212, 170, 0.2) !important;
          }
          
          .custom-input::placeholder {
            color: rgba(255, 255, 255, 0.5) !important;
          }
          
          .custom-steps .ant-steps-item-title {
            color: var(--text-light) !important;
            font-weight: 500 !important;
          }
          
          .custom-steps .ant-steps-item-description {
            color: var(--text-secondary) !important;
          }
          
          .custom-steps .ant-steps-item-icon {
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
          }
          
          .custom-steps .ant-steps-item-process .ant-steps-item-icon {
            background: var(--client-accent) !important;
            border-color: var(--client-accent) !important;
          }
          
          .custom-steps .ant-steps-item-finish .ant-steps-item-icon {
            background: var(--client-accent) !important;
            border-color: var(--client-accent) !important;
          }
          
          .custom-steps .ant-steps-item-finish .ant-steps-item-title {
            color: var(--client-accent) !important;
          }
          
          .custom-steps .ant-steps-item-finish .ant-steps-item-tail::after {
            background: var(--client-accent) !important;
          }
          
          .ant-form-item-label > label {
            color: var(--text-light) !important;
            font-weight: 500 !important;
          }
          
          .ant-alert {
            background: rgba(59, 130, 246, 0.1) !important;
            border: 1px solid rgba(59, 130, 246, 0.2) !important;
          }
          
          .ant-alert-message {
            color: var(--text-light) !important;
          }
          
          .ant-alert-description {
            color: var(--text-secondary) !important;
          }
          
          .ant-result-title {
            color: var(--text-light) !important;
          }
          
          .ant-result-subtitle {
            color: var(--text-secondary) !important;
          }
          
          /* Custom Tag styling for better visibility */
          .ant-tag {
            background: rgba(0, 212, 170, 0.2) !important;
            border: 1px solid rgba(0, 212, 170, 0.3) !important;
            color: var(--client-accent) !important;
            font-weight: 600 !important;
          }
          
          .ant-tag.ant-tag-blue {
            background: rgba(59, 130, 246, 0.2) !important;
            border: 1px solid rgba(59, 130, 246, 0.3) !important;
            color: #60A5FA !important;
          }
          
          .ant-tag.ant-tag-green {
            background: rgba(34, 197, 94, 0.2) !important;
            border: 1px solid rgba(34, 197, 94, 0.3) !important;
            color: #4ADE80 !important;
          }
          
          .ant-tag.ant-tag-red {
            background: rgba(239, 68, 68, 0.2) !important;
            border: 1px solid rgba(239, 68, 68, 0.3) !important;
            color: #F87171 !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ScopeOptions;
