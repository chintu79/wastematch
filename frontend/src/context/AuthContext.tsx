'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, Facility } from '@/types/auth';
import { DEMO_USERS } from '@/lib/api';

interface RegisterData {
  display_name: string;
  email: string;
  password?: string;
  phone?: string;
  designation?: string;
  role: UserRole;
  organization_name: string;
  organization_type: 'waste_generator' | 'buyer' | 'waste_processor' | 'recycler';
  industrial_zone: string;
  city: string;
  facility_name: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  activeFacility: Facility | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  loginAsDemoRole: (role: UserRole) => void;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  setActiveFacility: (facility: Facility) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'wm_auth_user';
const STORAGE_KEY_TOKEN = 'wm_auth_token';

function getInitialUser(): User {
  if (typeof window === 'undefined') {
    return DEMO_USERS.waste_supplier;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    if (stored) {
      return JSON.parse(stored) as User;
    }
  } catch {
    // fallback
  }
  return DEMO_USERS.waste_supplier;
}

function getInitialFacility(user: User): Facility | null {
  return user.organization?.facilities?.[0] || null;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeFacility, setActiveFacilityState] = useState<Facility | null>(() => {
    const initUser = getInitialUser();
    return getInitialFacility(initUser);
  });

  const login = async (email: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const matched = Object.values(DEMO_USERS).find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      const targetUser = matched || {
        ...DEMO_USERS.waste_supplier,
        email,
        display_name: email.split('@')[0],
      };

      setUser(targetUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(targetUser));
        localStorage.setItem(STORAGE_KEY_TOKEN, `wm-token-${targetUser.role}`);
      }
      if (targetUser.organization?.facilities?.length) {
        setActiveFacilityState(targetUser.organization.facilities[0]);
      }
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemoRole = (targetRole: UserRole) => {
    const demoUser = DEMO_USERS[targetRole] || DEMO_USERS.waste_supplier;
    setUser(demoUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(demoUser));
      localStorage.setItem(STORAGE_KEY_TOKEN, `wm-token-${targetRole}`);
    }
    if (demoUser.organization?.facilities?.length) {
      setActiveFacilityState(demoUser.organization.facilities[0]);
    }
  };

  const switchRole = (newRole: UserRole) => {
    loginAsDemoRole(newRole);
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        email: data.email,
        display_name: data.display_name,
        role: data.role,
        phone: data.phone,
        designation: data.designation,
        created_at: new Date().toISOString(),
        organization: {
          id: `org-${Date.now()}`,
          name: data.organization_name,
          organization_type: data.organization_type,
          registration_number: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
          verification_status: 'pending',
          address: {
            line1: data.industrial_zone,
            city: data.city || 'Pimpri-Chinchwad, Pune',
            state: 'Maharashtra',
            postal_code: '411018',
            country: 'India',
            industrial_zone: data.industrial_zone,
          },
          facilities: [
            {
              id: `fac-${Date.now()}`,
              name: data.facility_name || 'Primary Plant Facility',
              facility_code: `FAC-${data.industrial_zone.substring(0, 3).toUpperCase()}-01`,
              location: `${data.industrial_zone}, Pune`,
              consent_number: 'MPCB-APPLICATION-PENDING',
            },
          ],
        },
      };

      setUser(newUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
        localStorage.setItem(STORAGE_KEY_TOKEN, `wm-token-${newUser.role}`);
      }
      if (newUser.organization?.facilities?.length) {
        setActiveFacilityState(newUser.organization.facilities[0]);
      }
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setActiveFacilityState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  };

  const setActiveFacility = (facility: Facility) => {
    setActiveFacilityState(facility);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'waste_supplier',
        activeFacility,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsDemoRole,
        register,
        logout,
        switchRole,
        setActiveFacility,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
