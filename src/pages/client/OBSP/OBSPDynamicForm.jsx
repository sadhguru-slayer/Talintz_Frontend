import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { 
  Form, Input, Select, Radio, Checkbox, InputNumber, DatePicker, 
  Upload, Button, Typography, Card, Space, Tag, Tooltip, Alert,
  Divider, Row, Col
} from 'antd';
import { 
  UploadOutlined, InfoCircleOutlined, DollarOutlined,
  CheckCircleOutlined, PlusOutlined, MinusOutlined,
  UserOutlined, CheckCircleOutlined as CheckCircleIcon, 
  PlusOutlined as PlusIcon, ShoppingOutlined, CheckOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {getBaseURL} from '../../../config/axios';


const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const OBSPDynamicForm = ({ 
  phases = [], 
  onValuesChange, 
  initialValues = {},
  selectedLevel,
  basePrice = 0,
  draftData = null,
  preFilledData = null
}) => {
  // Use ref to track if draft is loaded to prevent re-loading
  const draftLoadedRef = useRef(false);
  
  // Single source of truth - only use component state
  const [formValues, setFormValues] = useState(initialValues);

  // Load pre-filled data when component mounts - ONLY ONCE
  useEffect(() => {
    if (preFilledData && Object.keys(preFilledData).length > 0 && !draftLoadedRef.current) {
      console.log('Loading pre-filled data into form:', preFilledData);
      
      // Convert the data to proper format for each field type
      const convertedData = {};
      
      Object.entries(preFilledData).forEach(([fieldId, value]) => {
        if (value !== null && value !== undefined) {
          // Handle different data types properly
          if (Array.isArray(value)) {
            // For checkbox fields, ensure it's an array
            convertedData[fieldId] = value;
          } else if (typeof value === 'string' && value.trim() !== '') {
            // For text fields, ensure it's a string
            convertedData[fieldId] = value;
          } else if (typeof value === 'number') {
            // For number fields, ensure it's a number
            convertedData[fieldId] = value;
          } else if (value) {
            // For other types, just use the value
            convertedData[fieldId] = value;
          }
        }
      });
      
      console.log('Converted pre-filled data:', convertedData);
      setFormValues(convertedData);
      draftLoadedRef.current = true;
    }
  }, [preFilledData]);

  // Load draft data from phases - ONLY ONCE (fallback)
  useEffect(() => {
    if (phases && phases.length > 0 && !draftLoadedRef.current) {
      const draftResponses = {};
      
      // Extract draft data from phases
      phases.forEach(phase => {
        if (phase.draft_data && phase.draft_data.has_draft) {
          const phaseResponses = phase.draft_data.responses || {};
          Object.assign(draftResponses, phaseResponses);
        }
      });
      
      // If we found draft data, set it
      if (Object.keys(draftResponses).length > 0) {
        console.log('Loading draft data from phases:', draftResponses);
        setFormValues(draftResponses);
        draftLoadedRef.current = true;
      }
    }
  }, [phases]);

  // Memoize price calculation to prevent unnecessary recalculations
  const priceCalculation = useMemo(() => {
    let totalImpact = 0;
    const impacts = {};
    const phaseImpacts = {};

    phases.forEach(phase => {
      let phaseImpact = 0;
      const phaseFields = phase.fields || [];
      
      phaseFields.forEach(field => {
        if (field && field.has_price_impact) {
          if (field.field_type === 'radio' || field.field_type === 'select') {
            const selectedValue = formValues[field.id];
            if (selectedValue && field.options && Array.isArray(field.options)) {
              const selectedOption = field.options.find(opt => 
                typeof opt === 'object' ? opt.text === selectedValue : opt === selectedValue
              );
              if (selectedOption && typeof selectedOption === 'object' && selectedOption.price) {
                impacts[field.id] = selectedOption.price;
                phaseImpact += selectedOption.price;
                totalImpact += selectedOption.price;
              }
            }
          } else if (field.field_type === 'checkbox') {
            const selectedValues = formValues[field.id] || [];
            let fieldImpact = 0;
            if (Array.isArray(selectedValues) && field.options && Array.isArray(field.options)) {
              selectedValues.forEach(selectedValue => {
                const checkboxOption = field.options.find(opt => 
                  typeof opt === 'object' ? opt.text === selectedValue : opt === selectedValue
                );
                if (checkboxOption && typeof checkboxOption === 'object' && checkboxOption.price) {
                  fieldImpact += checkboxOption.price;
                }
              });
            }
            impacts[field.id] = fieldImpact;
            phaseImpact += fieldImpact;
            totalImpact += fieldImpact;
          } else if (field.field_type === 'number') {
            // For number fields, only add price impact if there's a value
            const fieldValue = formValues[field.id];
            if (fieldValue && fieldValue > 0) {
              const fieldImpact = parseFloat(field.price_impact) || 0;
              impacts[field.id] = fieldImpact;
              phaseImpact += fieldImpact;
              totalImpact += fieldImpact;
            }
          }
        }
      });
      
      if (phaseImpact > 0) {
        phaseImpacts[phase.phase] = phaseImpact;
      }
    });

    return { totalImpact, impacts, phaseImpacts };
  }, [phases, formValues]);

  // Debounced callback to parent - memoized to prevent recreation
  const debouncedOnValuesChange = useMemo(() => {
    let timeoutId;
    return (data) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onValuesChange?.(data);
      }, 300);
    };
  }, [onValuesChange]);

  // Only call parent when formValues or priceCalculation changes
  useEffect(() => {
    const newTotal = basePrice + priceCalculation.totalImpact;
    debouncedOnValuesChange({ 
      responses: formValues, 
      totalPrice: newTotal,
      priceImpacts: priceCalculation.impacts,
      phaseImpacts: priceCalculation.phaseImpacts
    });
  }, [formValues, priceCalculation.totalImpact, basePrice, debouncedOnValuesChange]);

  // Memoized field change handler
  const handleFieldChange = useCallback((fieldId, value) => {
    console.log(`Field ${fieldId} changed to:`, value);
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  }, []);

  // Memoized field renderer to prevent infinite re-renders
  const renderField = useCallback((field) => {
    if (!field || !field.id) return null;

    const fieldValue = formValues[field.id];
    const isRequired = field.is_required;
    const hasPricing = field.has_price_impact;

    const label = (
      <span className="text-text-light font-medium flex items-center gap-2 mb-2 block">
        {field.label || 'Untitled Field'}
        {hasPricing && <DollarOutlined className="text-client-accent" />}
        {isRequired && <span className="text-red-500">*</span>}
        {field.help_text && (
          <Tooltip title={field.help_text}>
            <InfoCircleOutlined className="text-text-secondary" />
          </Tooltip>
        )}
      </span>
    );

    switch (field.field_type) {
      case 'text':
        return (
          <div key={field.id} className="mb-4">
            {label}
            <Input 
              placeholder={field.placeholder || ''}
              size="large"
              className="custom-input"
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="mb-4">
            {label}
            <TextArea 
              placeholder={field.placeholder || ''}
              rows={4}
              className="custom-input"
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="mb-4">
            {label}
            <InputNumber 
              placeholder={field.placeholder || ''}
              style={{ width: '100%' }}
              size="large"
              className="custom-input"
              value={fieldValue !== null && fieldValue !== undefined ? fieldValue : undefined}
              onChange={(value) => handleFieldChange(field.id, value)}
            />
            {hasPricing && fieldValue && fieldValue > 0 && (
              <div className="mt-2">
                <Tag color="blue" className="text-xs">
                  +₹{(parseFloat(field.price_impact) || 0).toLocaleString()}
                </Tag>
              </div>
            )}
          </div>
        );

      case 'email':
        return (
          <div key={field.id} className="mb-4">
            {label}
            <Input 
              type="email"
              placeholder={field.placeholder || ''}
              size="large"
              className="custom-input"
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
          </div>
        );

      case 'phone':
        return (
          <div key={field.id} className="mb-4">
            {label}
            <Input 
              type="tel"
              placeholder={field.placeholder || ''}
              size="large"
              className="custom-input"
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="mb-4">
            {label}
            <DatePicker 
              placeholder={field.placeholder || ''}
              style={{ width: '100%' }}
              size="large"
              className="custom-input"
              value={fieldValue ? dayjs(fieldValue) : null}
              onChange={(date, dateString) => handleFieldChange(field.id, dateString)}
            />
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="mb-4">
            {label}
            <Radio.Group
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="w-full"
            >
              <Space direction="vertical" className="w-full">
                {Array.isArray(field.options) && field.options.map((option, idx) => {
                  const optionText = typeof option === 'object' ? option.text : option;
                  const optionPrice = typeof option === 'object' ? option.price : 0;
                  const optionDesc = typeof option === 'object' ? option.description : '';
                  
                  return (
                    <div
                      key={idx}
                      className={`transition-all duration-200 ${
                        fieldValue === optionText
                          ? 'bg-white/10 border-client-accent' 
                          : 'bg-white/5 hover:bg-white/8 border-white/20'
                      } border rounded-lg p-4`}
                    >
                      <Radio value={optionText} className="w-full">
                        <div className="flex items-start justify-between w-full">
                          <div className="flex-1">
                            <div className="text-text-light font-medium mb-1">{optionText}</div>
                            {optionDesc && (
                              <div className="text-text-secondary text-sm">{optionDesc}</div>
                            )}
                          </div>
                          {optionPrice > 0 && (
                            <Tag color="blue" className="ml-2">
                              +₹{optionPrice.toLocaleString()}
                            </Tag>
                          )}
                        </div>
                      </Radio>
                    </div>
                  );
                })}
              </Space>
            </Radio.Group>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="mb-4">
            {label}
            <Checkbox.Group
              value={Array.isArray(fieldValue) ? fieldValue : []}
              onChange={(values) => handleFieldChange(field.id, values)}
              className="w-full"
            >
              <Space direction="vertical" className="w-full">
                {Array.isArray(field.options) && field.options.map((option, idx) => {
                  const optionText = typeof option === 'object' ? option.text : option;
                  const optionPrice = typeof option === 'object' ? option.price : 0;
                  const optionDesc = typeof option === 'object' ? option.description : '';
                  
                  return (
                    <div
                      key={idx}
                      className={`transition-all duration-200 ${
                        (fieldValue || []).includes(optionText)
                          ? 'bg-white/10 border-green-500' 
                          : 'bg-white/5 hover:bg-white/8 border-white/20'
                      } border rounded-lg p-4`}
                    >
                      <Checkbox value={optionText} className="w-full">
                        <div className="flex items-start justify-between w-full">
                          <div className="flex-1">
                            <div className="text-text-light font-medium mb-1">{optionText}</div>
                            {optionDesc && (
                              <div className="text-text-secondary text-sm">{optionDesc}</div>
                            )}
                          </div>
                          {optionPrice > 0 && (
                            <Tag color="green" className="ml-2">
                              +₹{optionPrice.toLocaleString()}
                            </Tag>
                          )}
                        </div>
                      </Checkbox>
                    </div>
                  );
                })}
              </Space>
            </Checkbox.Group>
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="mb-4">
            {label}
            <Select
              placeholder="Select an option"
              size="large"
              className="custom-select"
              dropdownClassName="custom-select-dropdown"
              value={fieldValue}
              onChange={(value) => handleFieldChange(field.id, value)}
              style={{
                backgroundColor: 'var(--client-primary)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'var(--text-light)',
                width: '100%'
              }}
            >
              {Array.isArray(field.options) && field.options.map((option, idx) => {
                const optionText = typeof option === 'object' ? option.text : option;
                const optionPrice = typeof option === 'object' ? option.price : 0;
                const optionDesc = typeof option === 'object' ? option.description : '';
                
                return (
                  <Option 
                    key={idx} 
                    value={optionText}
                  >
                    <div className="flex items-center justify-between py-1">
                      <div className="flex-1">
                        <div className="text-text-light font-medium">{optionText}</div>
                        {optionDesc && (
                          <div className="xs text-text-secondary mt-1 leading-relaxed">
                            {optionDesc}
                          </div>
                        )}
                      </div>
                      {optionPrice > 0 && (
                        <span className="text-client-accent font-medium ml-3 flex-shrink-0">
                          +₹{optionPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </Option>
                );
              })}
            </Select>
          </div>
        );

      case 'file':
        return (
          <div key={field.id} className="mb-4">
            {label}
            <Upload
              beforeUpload={() => false}
              onChange={(info) => handleFieldChange(field.id, info.fileList)}
              multiple={true}
              fileList={Array.isArray(fieldValue) ? fieldValue : []}
            >
              <Button 
                icon={<UploadOutlined />} 
                className="custom-input"
                style={{ width: '100%' }}
                size="large"
              >
                Upload Files
              </Button>
            </Upload>
          </div>
        );

      default:
        return null;
    }
  }, [formValues, handleFieldChange]);

  // Memoize the phases rendering to prevent unnecessary re-renders
  const renderedPhases = useMemo(() => {
    if (!phases || !Array.isArray(phases) || phases.length === 0) {
      return null;
    }

    return phases.map((phase, phaseIndex) => (
      <Card key={phase.phase} className="bg-white/5 border border-white/10">
        <div className="space-y-4">
          {phase.fields && phase.fields.map((field) => (
            <div key={field.id}>
              {renderField(field)}
            </div>
          ))}
        </div>
      </Card>
    ));
  }, [phases, renderField]);

  // Show loading state if phases is null
  if (!phases) {
    return (
      <Card className="bg-white/5 border border-white/10">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-client-accent mx-auto mb-4"></div>
          <Text className="text-text-light/50">Loading form fields...</Text>
        </div>
      </Card>
    );
  }

  // Show empty state if no phases
  if (!Array.isArray(phases) || phases.length === 0) {
    return (
      <Card className="bg-white/5 border border-white/10">
        <div className="text-center p-8">
          <Text className="text-text-light/50">No custom fields for this level</Text>
        </div>
      </Card>
    );
  }

  // Check if any phase has draft data
  const hasDraftData = phases.some(phase => phase.draft_data && phase.draft_data.has_draft) || (preFilledData && Object.keys(preFilledData).length > 0);

  return (
    <div className="space-y-6">
      {/* Draft Data Alert */}
      {hasDraftData && (
        <Alert
          message="Draft Configuration Loaded"
          description={`Your previous configuration has been loaded. You can modify it or continue with the purchase.`}
          type="info"
          showIcon
          icon={<FileTextOutlined />}
          className="mb-4"
        />
      )}

      {/* Debug Info - Show current form values */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <Text className="text-blue-500 text-sm">
            Debug: Current form values: {JSON.stringify(formValues, null, 2)}
          </Text>
        </div>
      )}

      {renderedPhases}

      {/* Custom CSS for Select styling */}
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
        
        .custom-select .ant-select-selector {
          background-color: var(--client-primary) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 8px !important;
          color: var(--text-light) !important;
          min-height: 40px !important;
          padding: 8px 12px !important;
        }
        
        .custom-select .ant-select-selection-item {
          color: var(--text-light) !important;
          line-height: 1.4 !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        
        .custom-select .ant-select-selection-placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
          line-height: 1.4 !important;
        }
        
        .custom-select .ant-select-arrow {
          color: var(--text-light) !important;
        }
        
        .custom-select:hover .ant-select-selector {
          border-color: var(--client-accent) !important;
        }
        
        .custom-select.ant-select-focused .ant-select-selector {
          border-color: var(--client-accent) !important;
          box-shadow: 0 0 0 2px rgba(0, 212, 170, 0.2) !important;
        }
        
        .custom-select-dropdown .ant-select-item {
          background-color: var(--client-primary) !important;
          color: var(--text-light) !important;
          padding: 8px 12px !important;
          min-height: auto !important;
        }
        
        .custom-select-dropdown .ant-select-item:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
        
        .custom-select-dropdown .ant-select-item-option-selected {
          background-color: var(--client-accent) !important;
          color: white !important;
        }
        
        .custom-select-dropdown .ant-select-item-option-active {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
        
        .custom-select-dropdown .ant-select-item .ant-select-item-option-content {
          padding: 0 !important;
          margin: 0 !important;
          line-height: 1.4 !important;
        }
        
        .custom-select .ant-select-selection-search {
          line-height: 1.4 !important;
        }
        
        .custom-select-dropdown .ant-select-item-option-content {
          white-space: normal !important;
          word-wrap: break-word !important;
        }
      `}</style>
    </div>
  );
};

export default OBSPDynamicForm;