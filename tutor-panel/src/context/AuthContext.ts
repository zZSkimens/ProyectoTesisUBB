import { createContext } from 'react';
import type { AuthContextType } from '../types/index';

export const AuthContext = createContext<AuthContextType | null>(null);
