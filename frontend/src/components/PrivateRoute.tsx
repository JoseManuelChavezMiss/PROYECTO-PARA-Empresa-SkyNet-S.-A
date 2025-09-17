import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axiosClient from "../services/axiosCliente";
import type { JSX } from "react/jsx-runtime";

interface PrivateRouteProps {
  children: JSX.Element;
  roles?: string[];
}

export const PrivateRoute = ({ children, roles }: PrivateRouteProps) => {
  const token = localStorage.getItem("auth_token");
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) { setChecked(true); setAllowed(false); return; }
      try {
        const { data } = await axiosClient.get<{ user: { rol?: { name?: string }, rolNombre?: string } }>("/api/auth/me");
        const roleName = data.user?.rol?.name || data.user?.rolNombre || "";
        const ok = !roles || roles.includes(roleName);
        if (!cancelled) { setAllowed(ok); setChecked(true); }
      } catch {
        if (!cancelled) { setAllowed(false); setChecked(true); }
      }
    })();
    return () => { cancelled = true; };
  }, [token, roles]);

  if (!token) return <Navigate to="/" replace />;
  if (!checked) return null;           // loader opcional
  if (!allowed) return <Navigate to="/" replace />;
  return children;
};
