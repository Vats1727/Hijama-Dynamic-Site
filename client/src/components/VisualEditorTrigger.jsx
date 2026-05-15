import React, { useState, useEffect, useRef } from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * VisualEditorTrigger
 * Contextual editor trigger that ONLY appears when the user clicks on a frontend section
 * within the Admin Simulator IFrame. Adds focus states and elegant overlays.
 */
const VisualEditorTrigger = ({ sectionPath, style = {} }) => {
  const isPreview = new URLSearchParams(window.location.search).get('admin_preview') === 'true';
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isPreview) return;

    const buttonEl = containerRef.current;
    if (!buttonEl) return;
    
    const parentNode = buttonEl.parentNode;
    if (!parentNode) return;

    // Record original CSS values to guarantee safety on unmount
    const originalPos = parentNode.style.position;
    const originalCursor = parentNode.style.cursor;
    const originalTransition = parentNode.style.transition;

    // Ensure parent forms a reliable absolute context
    if (!parentNode.style.position || parentNode.style.position === 'static') {
      parentNode.style.position = 'relative';
    }
    
    // Indicate to user that the section is interactive inside admin preview
    parentNode.style.cursor = 'pointer';
    parentNode.style.transition = (originalTransition ? `${originalTransition}, ` : '') + 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

    const handleParentClick = (e) => {
      // Catch user click
      setIsActive(true);
    };

    const handleGlobalClick = (e) => {
      // Hide button and remove focus if click lands outside this section
      if (parentNode && !parentNode.contains(e.target)) {
        setIsActive(false);
      }
    };

    parentNode.addEventListener('click', handleParentClick);
    document.addEventListener('click', handleGlobalClick);

    return () => {
      parentNode.removeEventListener('click', handleParentClick);
      document.removeEventListener('click', handleGlobalClick);
      
      // Safely restore style states
      parentNode.style.position = originalPos;
      parentNode.style.cursor = originalCursor;
      parentNode.style.transition = originalTransition;
    };
  }, [isPreview]);

  // Dynamic UI Reaction: Apply active highlight effects directly onto the Section DOM Node
  useEffect(() => {
    if (!isPreview || !containerRef.current) return;
    const parentNode = containerRef.current.parentNode;
    if (!parentNode) return;

    if (isActive) {
      parentNode.style.outline = '3px solid #4f46e5';
      parentNode.style.outlineOffset = '-3px';
      parentNode.style.boxShadow = 'inset 0 0 50px rgba(79, 70, 229, 0.06)';
    } else {
      parentNode.style.outline = 'none';
      parentNode.style.outlineOffset = '0';
      parentNode.style.boxShadow = 'none';
    }
  }, [isActive, isPreview]);

  if (!isPreview) return null;

  const handleTriggerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.parent) {
      window.parent.postMessage({ 
        type: 'OPEN_SECTION', 
        section: sectionPath 
      }, '*');
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setIsActive(false);
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'absolute', 
        top: '20px', 
        right: '20px', 
        zIndex: 99999,
        pointerEvents: 'auto'
      }}
    >
      {isActive && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            type="button"
            onClick={handleTriggerClick}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              color: '#ffffff',
              borderRadius: '30px',
              padding: '10px 20px',
              fontSize: '12px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 12px 30px rgba(79, 70, 229, 0.35)',
              transition: 'transform 0.2s ease, filter 0.2s ease',
              fontFamily: 'Inter, system-ui, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              ...style
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <LucideIcons.Pencil size={14} color="#ffffff" strokeWidth={2.5} />
            <span>Edit This Section</span>
          </button>

          <button 
            type="button"
            onClick={handleClose}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              width: '36px',
              height: '36px',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
          >
            <LucideIcons.X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default VisualEditorTrigger;

