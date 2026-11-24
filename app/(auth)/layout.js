
import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen justify-center pt-40 bg-background text-foreground">
      {children}
    </div>
  );
};

export default AuthLayout;
