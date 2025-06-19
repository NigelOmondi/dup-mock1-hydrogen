// app/components/WidgetLoader.client.jsx
import {useEffect} from 'react';

export const WidgetLoader = () => {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Check if widget already exists
    if (document.querySelector('elevenlabs-convai')) return;

    // Create widget element
    const widget = document.createElement('elevenlabs-convai');
    widget.setAttribute('agent-id', 'agent_01jxsgxprfegt8rwksggkxj2t3');
    widget.style.position = 'fixed';
    widget.style.bottom = '20px';
    widget.style.right = '20px';
    widget.style.zIndex = '1000';
    widget.style.height = '80px';
    widget.style.width = '80px';

    // Create script element if not already loaded
    if (!document.querySelector('script[src*="convai-widget-embed"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      document.head.appendChild(script);
    }

    // Add widget to body
    document.body.appendChild(widget);

    return () => {
      // Clean up on unmount
      if (widget.parentNode) {
        widget.parentNode.removeChild(widget);
      }
    };
  }, []);

  return null;
}