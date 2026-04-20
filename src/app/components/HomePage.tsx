import { Link } from "react-router";
import {
  Play,
  Clock,
  Star,
  LogOut,
  User,
  MessageSquare,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const podcasts = [
  {
    id: "1",
    title: "Литературные предпочтения молодежи",
    host: "Горьянова Татьяна, Ю-81",
    description:
      "Что читает молодежь сегодня? Исследуем последние тренды",
    duration: "12 мин",
    rating: 4.8,
    image:
      "https://sun9-45.userapi.com/s/v1/ig2/eCZXZvZZiWT3WKlpDE9ySZCulnYQPjFzFo-d64t3N6SlkE7YvnYWk1cSz2LF0200g_wjVbEbF9oQxehzFkTcFgK7.jpg?quality=95&as=32x21,48x32,72x48,108x72,160x107,240x160,360x240,480x320,540x360,640x426,720x480,1080x720,1280x853&from=bu&cs=1280x0",
  },
  {
    id: "2",
    title: "Пока пусто",
    host: "...",
    description: "Пока пусто",
    duration: "0 мин",
    rating: 0,
    image:
      "https://images.unsplash.com/photo-1653937049145-b37f88661a81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpbyUyMHJlY29yZGluZyUyMGVxdWlwbWVudHxlbnwxfHx8fDE3NzE4NDU2ODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "3",
    title: "Пока пусто",
    host: "...",
    description: "Пока пусто",
    duration: "0 мин",
    rating: 0,
    image:
      "https://images.unsplash.com/photo-1533379007656-3a10925da2e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm9hZGNhc3RpbmclMjBoZWFkcGhvbmVzJTIwd29ya3NwYWNlfGVufDF8fHx8MTc3MTg0NTY4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

export default function HomePage() {
  const { currentUser, logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <>
                <Link
                  to="/feedback"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  <MessageSquare className="w-5 h-5" />
                  Оставить отзыв
                </Link>
                {currentUser?.isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                  >
                    <Shield className="w-5 h-5" />
                    Админ-панель
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 text-white bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg">
                  <User className="w-5 h-5" />
                  <span>{currentUser?.fullName}</span>
                  {currentUser?.isAdmin && (
                    <span className="ml-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
                      Админ
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  <LogOut className="w-5 h-5" />
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-5xl text-white mb-4">
            Подкасты_Аносовец
          </h1>
          <p className="text-xl text-purple-200">
            Откройте для себя удивительные истории и беседы
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {podcasts.map((podcast) => (
            <Link
              key={podcast.id}
              to={`/podcast/${podcast.id}`}
              className="group"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:transform hover:scale-105 hover:bg-white/20">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={podcast.image}
                    alt={podcast.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
                      <Clock className="w-4 h-4" />
                      <span>{podcast.duration}</span>
                      <div className="flex items-center gap-1 ml-auto">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{podcast.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-6">
                      <Play className="w-12 h-12 text-white fill-white" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl text-white mb-2">
                    {podcast.title}
                  </h2>
                  <p className="text-purple-200 text-sm mb-3">
                    Ведущий: {podcast.host}
                  </p>
                  <p className="text-purple-100/80 text-sm line-clamp-2">
                    {podcast.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}