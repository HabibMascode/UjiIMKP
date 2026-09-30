import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import AdminLayout from '../layouts/AdminLayout';
import ParticipantLayout from '../layouts/ParticipantLayout';
import { useAuth } from '../hooks/useAuth';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import UserManagement from '../pages/admin/UserManagement';
import QuestionBank from '../pages/admin/QuestionBank';
import CreateQuestion from '../pages/admin/CreateQuestion';
import QuestionGroupDetail from '../pages/admin/QuestionGroupDetail';
import ExamResults from '../pages/admin/ExamResults';
import ResultDetail from '../pages/admin/ResultDetail';

// Participant Pages
import ParticipantDashboard from '../pages/participant/Dashboard';
import ExamPage from '../pages/participant/ExamPage';
import ExamResult from '../pages/participant/ExamResult';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'Admin' ? '/admin/dashboard' : '/peserta/dashboard'} />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={user && user.role === 'Admin' ? <AdminLayout /> : <Navigate to="/login" />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="questions" element={<QuestionBank />} />
        <Route path="questions/create" element={<CreateQuestion />} />
        <Route path="questions/:id" element={<QuestionGroupDetail />} />
        <Route path="questions/:id/edit" element={<CreateQuestion />} />
        <Route path="results" element={<ExamResults />} />
        <Route path="results/:id" element={<ResultDetail />} />
      </Route>

      {/* Participant Routes */}
      <Route path="/peserta" element={user && user.role === 'Peserta' ? <ParticipantLayout /> : <Navigate to="/login" />}>
        <Route path="dashboard" element={<ParticipantDashboard />} />
        <Route path="exam" element={<ExamPage />} />
        <Route path="result/:id" element={<ExamResult />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;
