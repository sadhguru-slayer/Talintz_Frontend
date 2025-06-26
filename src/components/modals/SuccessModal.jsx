import React from 'react';
import { Modal } from 'antd';

const SuccessModal = ({ visible, onConfirm }) => {
  return (
    <Modal
      title={
        <div className="text-lg font-semibold text-text-primary pb-3 border-b border-ui-border">
          Project Posted Successfully
        </div>
      }
      open={visible}
      onOk={onConfirm}
      onCancel={onConfirm}
      okText="Okay"
      className="custom-modal"
      centered
      maskClosable={false}
      closeIcon={
        <span className="text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      }
    >
      <div className="py-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-status-success bg-opacity-10 flex items-center justify-center">
            <svg className="w-6 h-6 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-text-secondary">
              Your project has been posted successfully! You can view and manage it from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal; 