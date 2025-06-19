"use client";
import { useEffect, useState } from "react";
import { Script } from "@shopify/hydrogen";

export function ConvaiWidget() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handler = () => setIsLoaded(true);
    
    if (customElements.get('elevenlabs-convai')) {
      setIsLoaded(true);
    } else {
      window.addEventListener('convai-widget-loaded', handler);
    }

    return () => {
      window.removeEventListener('convai-widget-loaded', handler);
    };
  }, []);

  return (
    <div style={{ /* styles */ }}>
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        type="module"
        onLoad={() => window.dispatchEvent(new Event('convai-widget-loaded'))}
      />
      
      {isLoaded ? (
        <elevenlabs-convai agent-id="agent_01jxsgxprfegt8rwksggkxj2t3" />
      ) : (
        <div>Loading AI assistant...</div>
      )}
    </div>
  );
}