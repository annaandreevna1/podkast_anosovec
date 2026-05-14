import { useState, useEffect } from "react";
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
import { getAverageRating } from "../utils/ratings";
import { getAllPodcasts, type Podcast } from "../utils/podcasts";
import heroImage from "../../imports/ChatGPT_Image_7_maya_2026_g__20_14_16-1.png";
import backgroundImage from "../../imports/maxresdefault.jpg";

export default function HomePage() {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [podcastRatings, setPodcastRatings] = useState<Record<string, { average: number; count: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Load podcasts from Supabase
      const podcastsData = await getAllPodcasts();
      setPodcasts(podcastsData);

      // Load ratings for all podcasts
      const ratings: Record<string, { average: number; count: number }> = {};
      for (const podcast of podcastsData) {
        const rating = await getAverageRating(podcast.id);
        ratings[podcast.id] = rating;
      }
      setPodcastRatings(ratings);

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center" style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute inset-0 bg-black/75"></div>
        <div className="relative z-10 text-white text-2xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-black/75"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {isAuthenticated && currentUser?.isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-amber-500/50 transition-all"
              >
                <Shield className="w-5 h-5" />
                Админ-панель
              </Link>
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
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-amber-500/50 transition-all"
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
                  className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-amber-500/50 transition-all"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Hero Section with Image */}
        <div className="relative mb-20 flex items-center justify-between gap-8">
          {/* Left - Text */}
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold mb-6 leading-tight italic" style={{ transform: 'rotate(-3deg)' }}>
              <span className="inline-block text-white" style={{ textShadow: '4px 4px 0px rgba(251, 146, 60, 0.3)' }}>
                ПОДКАСТЫ
              </span>
              <br />
              <span className="inline-block text-white" style={{ fontSize: '1.1em', letterSpacing: '-0.02em', textShadow: '3px 3px 0px rgba(251, 146, 60, 0.4)' }}>
                АНОСОВЕЦ
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-purple-200 mb-8">
              Голоса коллектива. Истории, которые вдохновляют
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#podcasts"
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-lg font-bold text-xl hover:shadow-lg hover:shadow-amber-500/50 transition-all flex items-center gap-2"
              >
                <Play className="w-6 h-6" />
                Смотреть подкасты
              </a>
              {isAuthenticated && (
                <Link
                  to="/feedback"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-lg font-medium transition-all border border-white/10 flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Оставить отзыв
                </Link>
              )}
            </div>
          </div>

          {/* Right - Image */}
          <div className="relative flex-shrink-0" style={{ width: '55%', marginLeft: '-10%' }}>
            <img
              src={heroImage}
              alt="Подкасты"
              className="w-full h-auto"
              style={{
                filter: 'drop-shadow(0 0 40px rgba(251, 146, 60, 0.6)) drop-shadow(0 0 80px rgba(245, 158, 11, 0.4))'
              }}
            />
          </div>
        </div>

        {/* Podcasts Section */}
        <div id="podcasts" className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Наши подкасты
            </h2>
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
                        <span>
                          {podcastRatings[podcast.id]
                            ? podcastRatings[podcast.id].average
                            : 0}
                        </span>
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
    </div>
  );
}