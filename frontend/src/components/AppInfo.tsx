import React from "react";
import { config } from "@/config";

export const AppInfo: React.FC = () => {
  return (
    <div className="text-sm text-gray-500">
      <p>{config.app.name} v{config.app.version}</p>
      <p>Environment: {config.app.env}</p>
      {config.app.debug && <p className="text-orange-500">Debug Mode</p>}
    </div>
  );
};
