import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getPortfolio } from './api.js';

// โหลด /api/portfolio ครั้งเดียวแล้วแชร์ให้ทุกหน้า (Home, Team, Profile, Projects, Contact)
const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getPortfolio());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const members = data?.members ?? [];
  const projects = data?.group?.projects ?? [];

  return (
    <PortfolioContext.Provider
      value={{ group: data?.group, members, projects, loading, error, reload: load }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}
