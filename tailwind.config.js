// Color configurations are now defined inline in the theme

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand Foundation Colors
        brand: {
          primary: '#0A0A1A',    // Darker background
          secondary: '#6D28D9',  // Rich purple
          tertiary: '#2563EB',   // Vibrant blue
          accent: '#8B5CF6',     // Lighter purple
          neutral: '#F7FAFC',    // Keep existing neutral
          dark: '#050510',       // Even darker background
          // Update color palette
          purple: {
            light: '#A78BFA',
            DEFAULT: '#8B5CF6',
            dark: '#6D28D9'
          },
          blue: {
            light: '#60A5FA',
            DEFAULT: '#2563EB',
            dark: '#1E40AF'
          },
          // Add new colors without breaking existing structure
          teal: '#00D4AA',      
          orange: '#F59E0B',    
          darkPrimary: '#0F0F23',
          darkSecondary: '#1A1B2E',
          darkTertiary: '#2D3748',
          lightPrimary: '#FFFFFF',
          lightSecondary: '#A0AEC0',
          lightMuted: '#718096',
        },

        // Text Colors - Enhanced for better readability
        text: {
          primary: '#2D3748',    // Dark blue-gray - less harsh than black
          secondary: '#4A5568',  // Medium blue-gray for secondary elements
          muted: '#718096',      // Light enough for tertiary text
          light: '#FFFFFF',      // Pure white for contrast
        },

        // UI Element Colors
        ui: {
          border: '#E2E8F0',     // Lighter border for subtlety
          hover: '#EDF2F7',      // Gentle hover state
          focus: '#CBD5E0',      // Distinct focus state
          disabled: '#A0AEC0',   // Accessible but clearly disabled
        },

        // Status Colors - Refined for better psychological impact
        status: {
          success: '#38A169',    // Green - achievement, progress
          error: '#E53E3E',      // Red - alerts, errors (slightly muted)
          warning: '#ED8936',    // Orange - caution (warmer tone)
          info: '#3182CE',       // Blue - informational
        },

        // Client-specific Colors - Professional, Premium, Trust (Based on UI Design)
        client: {
          primary: '#1A1B2E',    // Deep navy background from design
          secondary: '#252A3A',  // Dark blue cards/elements
          tertiary: '#E2E8F0',   // Light gray for contrast
          accent: '#00D4AA',     // Teal accent color from design
          orange: '#F59E0B',
          bg: {
            DEFAULT: '#1A1B2E',  // Dark navy background
            card: '#252A3A',     // Dark blue cards
            dark: '#0F0F23',     // Even darker background variant
          },
          border: {
            DEFAULT: '#2D3748',  // Subtle dark borders
            focus: '#00D4AA',    // Teal focus state
          },
          text: {
            primary: '#FFFFFF',  // White text on dark background
            secondary: '#A0AEC0', // Light gray secondary text
            muted: '#718096',    // Muted text
          }
        },

        // Freelancer-specific Colors - Energetic, Creative, Dynamic (Based on UI Design)
        freelancer: {
          primary: '#0F0F23',    // Deep dark background from design
          secondary: '#6366F1',  // Purple/indigo from design
          tertiary: '#1A1B2E',   // Secondary dark background
          accent: '#6366F1',     // Bright teal accent
          orange: '#F59E0B',     // Orange accent from design
          purple: '#8B5CF6',     // Purple variant
          bg: {
            DEFAULT: '#0F0F23',  // Dark gradient background
            card: '#1A1B2E',     // Card background
            gradient: 'linear-gradient(135deg, #0F0F23 0%, #1A1B2E 100%)', // Gradient background
          },
          border: {
            DEFAULT: '#2D3748',  // Dark borders
            focus: '#6366F1',    // Purple focus state
          },
          text: {
            primary: '#FFFFFF',  // White text
            secondary: '#A0AEC0', // Light gray secondary text
            muted: '#718096',    // Muted text
            accent: '#00D4AA',   // Teal accent text
          }
        },

        // Professional notification colors
        notification: {
          client: {
            bg: '#FFFFFF',
            border: '#E5E7EB',
            icon: '#2563EB',
            text: '#1F2937',
            textSecondary: '#6B7280',
            accent: '#2563EB',
            hover: '#F9FAFB'
          },
          freelancer: {
            bg: '#FFFFFF',
            border: '#E5E7EB',
            icon: '#7C3AED',
            text: '#1F2937',
            textSecondary: '#6B7280',
            accent: '#7C3AED',
            hover: '#F9FAFB'
          }
        }
      },

      // Consistent spacing system
      spacing: {
        px: '1px',
        0: '0',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
      },

      // Typography system
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },

      // Font weights
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },

      // Border radius
      borderRadius: {
        none: '0',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        full: '9999px',
      },

      // IMPROVED shadows - Removed white shadows, added dark shadows for better contrast
      boxShadow: {
        none: 'none',
        sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        DEFAULT: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
        md: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
        lg: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
        xl: '0 20px 40px rgba(0, 0, 0, 0.30), 0 15px 15px rgba(0, 0, 0, 0.20)',
        inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)',
        
        // Dark theme shadows for better contrast
        'dark-sm': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4)',
        'dark-md': '0 4px 8px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.5)',
        'dark-lg': '0 8px 16px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.6)',
        'dark-xl': '0 12px 24px rgba(0, 0, 0, 0.6), 0 6px 12px rgba(0, 0, 0, 0.7)',
        
        // Glow effects for accents
        'glow-teal': '0 0 20px rgba(0, 212, 170, 0.3)',
        'glow-purple': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-orange': '0 0 20px rgba(245, 158, 11, 0.3)',
        
        // Subtle shadows for cards
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.15)',
        
        // Notification shadows
        'notification': '0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3)',
        'notification-hover': '0 12px 40px rgba(0, 0, 0, 0.5), 0 6px 20px rgba(0, 0, 0, 0.4)',

        // Professional notification shadows
        'notification-sm': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'notification-md': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'notification-lg': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'notification-xl': '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
      },

      // Animation durations for micro-interactions
      transitionDuration: {
        DEFAULT: '200ms',
        fast: '100ms',
        slow: '300ms',
        medium: '250ms',
      },

      // Animation timing functions for better UX
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'premium': 'cubic-bezier(0.2, 0.8, 0.2, 1)', // Smooth, sophisticated movement
      },

      // Z-index
      zIndex: {
        behind: -1,
        auto: 'auto',
        base: 0,
        docked: 10,
        dropdown: 1000,
        sticky: 1100,
        overlay: 1300,
        modal: 1400,
        popover: 1500,
        tooltip: 1600,
      },

      // IMPROVED gradients for better visual appeal
      backgroundImage: {
        // Client gradients - professional, stable, dark theme
        'client-gradient-primary': 'linear-gradient(135deg, #1A1B2E 0%, #252A3A 100%)',
        'client-gradient-accent': 'linear-gradient(135deg, #252A3A 0%, #00D4AA 100%)',
        'client-gradient-soft': 'linear-gradient(145deg, #0F0F23 0%, #1A1B2E 100%)',
        'client-gradient-card': 'linear-gradient(135deg, #252A3A 0%, #2D3748 100%)',
        
        // Freelancer gradients - energetic, creative, dynamic
        'freelancer-gradient-primary': 'linear-gradient(135deg, #0F0F23 0%, #1A1B2E 50%, #6366F1 100%)',
        'freelancer-gradient-accent': 'linear-gradient(135deg, #00D4AA 0%, #6366F1 100%)',
        'freelancer-gradient-creative': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #F59E0B 100%)',
        'freelancer-gradient-teal': 'linear-gradient(135deg, #00D4AA 0%, #4ECDC4 100%)',
        'freelancer-gradient-card': 'linear-gradient(135deg, #1A1B2E 0%, #2D3748 100%)',
        
        // Common gradients
        'gradient-success': 'linear-gradient(135deg, #38A169 0%, #48BB78 100%)',
        'gradient-warning': 'linear-gradient(135deg, #ED8936 0%, #F6AD55 100%)',
        'gradient-danger': 'linear-gradient(135deg, #E53E3E 0%, #FC8181 100%)',
        
        // Notification gradients
        'notification-client': 'linear-gradient(135deg, #1A1B2E 0%, #252A3A 100%)',
        'notification-freelancer': 'linear-gradient(135deg, #0F0F23 0%, #1A1B2E 100%)',
      },

      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },

      backgroundSize: {
        'size-200': '200% 200%',
      },

      backgroundPosition: {
        'pos-0': '0% 0%',
        'pos-100': '100% 100%',
      }
    },
  },
  plugins: [
    import('tailwind-scrollbar'),
  ],
};
