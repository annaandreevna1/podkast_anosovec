import { HashRouter, Routes, Route } from "react-router";
import HomePage from "./components/HomePage";
import PodcastDetailPage from "./components/PodcastDetailPage";
import RegistrationPage from "./components/RegistrationPage";
import LoginPage from "./components/LoginPage";
import FeedbackPage from "./components/FeedbackPage";
import AdminPage from "./components/AdminPage";
import AnalyticsPage from "./components/AnalyticsPage";
import ManagePodcastsPage from "./components/ManagePodcastsPage";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/podcasts" element={<HomePage />} />
          <Route path="/podcast/:id" element={<PodcastDetailPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/manage-podcasts" element={<ManagePodcastsPage />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}