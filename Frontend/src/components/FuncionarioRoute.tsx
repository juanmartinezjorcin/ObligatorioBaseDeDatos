import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FuncionarioRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;
  if (!user) return <Navigate to="/login" />;
  if (role !== 'funcionario') return <Navigate to="/home" />;

  return <>{children}</>;
};

export default FuncionarioRoute;