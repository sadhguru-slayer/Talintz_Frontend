import React from 'react';
import PropTypes from 'prop-types';

/**
 * Currency icon component with circular outline
 * @param {string} currency - Currency code (inr, usd, etc.)
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional inline styles
 */
const CurrencyOutline = ({ currency = 'inr', className, style }) => {
  // Get currency symbol based on currency code
  const getCurrencySymbol = (currencyCode) => {
    switch(currencyCode.toLowerCase()) {
      case 'inr':
      case 'rupee':
        return '₹';
      case 'usd':
      case 'dollar':
        return '$';
      case 'eur':
      case 'euro':
        return '€';
      case 'gbp':
      case 'pound':
        return '£';
      case 'yen':
      case 'jpy':
        return '¥';
      default:
        return '₹'; // Default to INR
    }
  };

  return (
    <span 
      className={`currency-outline-icon ${className || ''} inline-flex items-center justify-center`} 
      style={style}
    >
      <span 
      className="rounded-full flex items-center justify-center"
      style={{ 
        width: '22px', 
        height: '22px', 
        lineHeight: 1,
        display: 'inline-flex'
      }}
      >
        <span style={{ fontFamily: 'Arial', fontWeight: 'bold' }}>
          {getCurrencySymbol(currency)}
        </span>
      </span>
    </span>
  );
};

CurrencyOutline.propTypes = {
  currency: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object
};

export default CurrencyOutline; 