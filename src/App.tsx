
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import * as React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import TeacherRoute from "@/components/TeacherRoute";
import SessionManager from "@/components/SessionManager";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Exercises from "./pages/Exercises";
import ExerciseForm from "./pages/ExerciseForm";
import ExercisePractice from "./pages/ExercisePractice";
import AdminPage from "./pages/admin/AdminPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import EscolasManagement from "./pages/admin/EscolasManagement";
import TurmasManagement from "./pages/admin/TurmasManagement";
import MatriculasManagement from "./pages/admin/MatriculasManagement";
import AtividadesManagement from "./pages/admin/AtividadesManagement";
import LeadsManagement from "./pages/admin/LeadsManagement";
import UserRegistration from "./pages/UserRegistration";
import StudentActivities from "./pages/StudentActivities";
import ActivityExercises from "./pages/ActivityExercises";
import ProfessorPage from "./pages/professor/ProfessorPage";
import ProfessorDashboard from "./pages/professor/ProfessorDashboard";
import ProfessorAtividades from "./pages/professor/ProfessorAtividades";
import ProfessorTurmas from "./pages/professor/ProfessorTurmas";
import ActivityReport from "./pages/professor/ActivityReport";
import AlunoEvolucao from "./pages/professor/AlunoEvolucao";

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SessionManager />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/entrar" element={<Login />} />
              <Route path="/cadastrar" element={<Register />} />
              <Route path="/recuperar-senha" element={<ForgotPassword />} />
              <Route path="/redefinir-senha" element={<ResetPassword />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/exercicios" element={
                <ProtectedRoute>
                  <Exercises />
                </ProtectedRoute>
              } />
              <Route path="/exercicios/resolver/:exerciseId" element={
                <ProtectedRoute>
                  <ExercisePractice />
                </ProtectedRoute>
              } />
              <Route path="/exercicios/cadastrar" element={
                <ProtectedRoute>
                  <TeacherRoute>
                    <ExerciseForm />
                  </TeacherRoute>
                </ProtectedRoute>
              } />
              <Route path="/exercicios/editar/:id" element={
                <ProtectedRoute>
                  <TeacherRoute>
                    <ExerciseForm />
                  </TeacherRoute>
                </ProtectedRoute>
              } />
              
              {/* Student Routes */}
              <Route path="/atividades" element={
                <ProtectedRoute>
                  <StudentActivities />
                </ProtectedRoute>
              } />
              <Route path="/atividades/:atividadeId" element={
                <ProtectedRoute>
                  <ActivityExercises />
                </ProtectedRoute>
              } />
              
              {/* Professor Routes */}
              <Route 
                path="/professor" 
                element={
                  <ProfessorPage>
                    <ProfessorDashboard />
                  </ProfessorPage>
                } 
              />
              <Route 
                path="/professor/atividades" 
                element={
                  <ProfessorPage>
                    <ProfessorAtividades />
                  </ProfessorPage>
                } 
              />
              <Route 
                path="/professor/atividades/:atividadeId/relatorio" 
                element={
                  <ProfessorPage>
                    <ActivityReport />
                  </ProfessorPage>
                } 
              />
              <Route 
                path="/professor/turmas" 
                element={
                  <ProfessorPage>
                    <ProfessorTurmas />
                  </ProfessorPage>
                } 
              />
              <Route 
                path="/professor/alunos/:alunoId/evolucao" 
                element={
                  <ProfessorPage>
                    <AlunoEvolucao />
                  </ProfessorPage>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin"
                element={
                  <AdminPage>
                    <AdminDashboard />
                  </AdminPage>
                } 
              />
              <Route 
                path="/admin/usuarios" 
                element={
                  <AdminPage>
                    <UserManagement />
                  </AdminPage>
                } 
              />
              <Route 
                path="/admin/escolas" 
                element={
                  <AdminPage>
                    <EscolasManagement />
                  </AdminPage>
                } 
              />
              <Route 
                path="/admin/turmas" 
                element={
                  <AdminPage>
                    <TurmasManagement />
                  </AdminPage>
                } 
              />
              <Route 
                path="/admin/matriculas" 
                element={
                  <AdminPage>
                    <MatriculasManagement />
                  </AdminPage>
                } 
              />
              <Route 
                path="/admin/usuarios/cadastrar" 
                element={
                  <AdminPage>
                    <UserRegistration />
                  </AdminPage>
                } 
              />
              <Route 
                path="/admin/usuarios/editar/:id" 
                element={
                  <AdminPage>
                    <UserRegistration />
                  </AdminPage>
                } 
              />
              <Route 
                path="/admin/atividades" 
                element={
                  <AdminPage>
                    <AtividadesManagement />
                  </AdminPage>
                } 
              />
              <Route 
                path="/admin/leads" 
                element={
                  <AdminPage>
                    <LeadsManagement />
                  </AdminPage>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
