import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Star,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Users,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAllFeedback, getFeedbackStats, type Feedback } from "../utils/feedback";

export default function AdminPage() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    withProblems: 0,
    withoutProblems: 0,
  });

  useEffect(() => {
    const loadFeedback = async () => {
      if (!isAuthenticated || !currentUser?.isAdmin) {
        navigate("/");
        return;
      }

      const allFeedback = await getAllFeedback();
      allFeedback.sort((a, b) => b.timestamp - a.timestamp);
      setFeedback(allFeedback);

      const feedbackStats = await getFeedbackStats();
      setStats(feedbackStats);
    };

    loadFeedback();
  }, [currentUser, isAuthenticated, navigate]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад к подкастам
          </Link>
          
          <Link
            to="/analytics"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            <TrendingUp className="w-5 h-5" />
            Отчет об эффективности
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl text-white mb-2">Панель администратора</h1>
          <p className="text-purple-200">Отзывы пользователей о работе системы</p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-6 h-6 text-blue-400" />
              <h3 className="text-purple-200">Всего отзывов</h3>
            </div>
            <p className="text-3xl text-white">{stats.total}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6 text-yellow-400" />
              <h3 className="text-purple-200">Средняя оценка</h3>
            </div>
            <p className="text-3xl text-white">
              {stats.averageRating > 0 ? stats.averageRating : "—"}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h3 className="text-purple-200">С проблемами</h3>
            </div>
            <p className="text-3xl text-white">{stats.withProblems}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-purple-200">Без проблем</h3>
            </div>
            <p className="text-3xl text-white">{stats.withoutProblems}</p>
          </div>
        </div>

        {/* Список отзывов */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl text-white mb-6 flex items-center gap-3">
            <BarChart3 className="w-7 h-7" />
            Все отзывы
          </h2>

          {feedback.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <p className="text-purple-200 text-lg">
                Пока нет отзывов от пользователей
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {feedback.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 rounded-xl p-6 border border-white/10"
                >
                  {/* Заголовок отзыва */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl text-white mb-1">{item.userName}</h3>
                      <p className="text-purple-300 text-sm">{item.userEmail}</p>
                      <p className="text-purple-400 text-xs mt-1">
                        {formatDate(item.timestamp)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= item.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-purple-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Проблемы */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      {item.hasProblems ? (
                        <>
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <h4 className="text-purple-200">Проблемы:</h4>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <h4 className="text-purple-200">Проблем не обнаружено</h4>
                        </>
                      )}
                    </div>
                    {item.hasProblems && item.problems && (
                      <p className="text-white bg-white/5 rounded-lg p-3 ml-7">
                        {item.problems}
                      </p>
                    )}
                  </div>

                  {/* Рекомендации */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                      <h4 className="text-purple-200">Рекомендации:</h4>
                    </div>
                    <p className="text-white bg-white/5 rounded-lg p-3 ml-7">
                      {item.recommendations}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}