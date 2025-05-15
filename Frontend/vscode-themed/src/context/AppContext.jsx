import { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeFile, setActiveFile] = useState(1);
  const [explorerWidth, setExplorerWidth] = useState(250);
  const [homeVisited, setHomeVisited] = useState(false);

  return (
    <AppContext.Provider
      value={{
        activeFile,
        setActiveFile,
        explorerWidth,
        setExplorerWidth,
        homeVisited,
        setHomeVisited,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
