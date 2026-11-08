import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextType } from '../types/index';

export const useAuth = (): AuthContextType => {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return contexto;
};
