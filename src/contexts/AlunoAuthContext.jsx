import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { app } from '../firebase/firebase';

const AlunoAuthContext = createContext();

export function useAlunoAuth() {
  return useContext(AlunoAuthContext);
}

export function AlunoAuthProvider({ children }) {
  const [aluno, setAluno] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAluno(user);
      setLoading(false);
    });
    return unsubscribe;
  }, [auth]);

  // Login do aluno
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  // Cadastro do aluno
  const register = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  // Logout do aluno
  const logout = () => signOut(auth);

  const value = { aluno, loading, login, register, logout };
  return (
    <AlunoAuthContext.Provider value={value}>
      {!loading && children}
    </AlunoAuthContext.Provider>
  );
}
