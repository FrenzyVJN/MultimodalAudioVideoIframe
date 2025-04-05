/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createContext, FC, ReactNode, useContext, useState, useEffect } from "react";
import { useLiveAPI, UseLiveAPIResults } from "../hooks/use-live-api";

// Extended context to include project context
interface LiveAPIContextProps extends UseLiveAPIResults {
  projectContext: any;
  setProjectContext: (context: any) => void;
}

const LiveAPIContext = createContext<LiveAPIContextProps | undefined>(undefined);

export type LiveAPIProviderProps = {
  children: ReactNode;
  url?: string;
  apiKey: string;
  initialProjectContext?: any;
};

export const LiveAPIProvider: FC<LiveAPIProviderProps> = ({
  url,
  apiKey,
  initialProjectContext = {},
  children,
}) => {
  const liveAPI = useLiveAPI({ url, apiKey });
  const [projectContext, setProjectContext] = useState<any>(initialProjectContext);

  // Listen for messages from parent window (iframe communication)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin if needed
      // if (event.origin !== "https://your-parent-domain.com") return;
      
      if (event.data && typeof event.data === 'object' && event.data.type === 'PROJECT_CONTEXT') {
        setProjectContext(event.data.context);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <LiveAPIContext.Provider value={{ ...liveAPI, projectContext, setProjectContext }}>
      {children}
    </LiveAPIContext.Provider>
  );
};

export const useLiveAPIContext = () => {
  const context = useContext(LiveAPIContext);
  if (!context) {
    throw new Error("useLiveAPIContext must be used wihin a LiveAPIProvider");
  }
  return context;
};
