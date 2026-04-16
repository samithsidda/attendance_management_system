import { createContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

export const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload };
    case 'LOGOUT':
      return { user: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        dispatch({ type: 'LOGIN', payload: user });

        try {
          const { default: api } = await import('../api/axios');
          const { data } = await api.get('/auth/profile');
          const freshUser = { ...data, token: user.token };
          localStorage.setItem('user', JSON.stringify(freshUser));
          dispatch({ type: 'LOGIN', payload: freshUser });
        } catch (error) {
          console.error("Profile refresh failed:", error);
        }
      }
    };
    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
