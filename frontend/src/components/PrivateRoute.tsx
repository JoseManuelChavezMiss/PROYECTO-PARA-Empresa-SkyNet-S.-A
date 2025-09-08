import { Navigate } from "react-router-dom";
import type { JSX } from "react/jsx-dev-runtime";

interface PrivateRouteProps {
  children: JSX.Element;
  roles?: string[]; 
}

export const PrivateRoute = ({ children, roles }: PrivateRouteProps) => {
  const token = localStorage.getItem("auth_token");
  const role = localStorage.getItem("role");

  // Si no hay token → redirigir a login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Si se pasan roles y el usuario no tiene permiso → redirigir
  if (roles && !roles.includes(role ?? "")) {
    return <Navigate to="/" replace />;
  }

  return children;
};