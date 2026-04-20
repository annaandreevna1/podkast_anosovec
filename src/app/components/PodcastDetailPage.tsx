import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Star,
  Clock,
  User,
  Calendar,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  saveRating,
  getUserRating,
  getAverageRating,
} from "../utils/ratings";

const podcastsData = [
  {
    id: "1",
    title: "Литературные предпочтения молодежи",
    host: "Горьянова Татьяна, Ю-81",
    description:
      "Что читает молодежь сегодня? Исследуем последние тренды",
    fullDescription:
      "Тема этого выпуска — литературные предпочтения молодежи. Вместе с учителями мы обсудим актуальные тренды, популярные жанры и то, что сегодня в моде у молодого поколения",
    duration: "12 мин",
    publishDate: "23 февраля 2026",
    rating: 4.8,
    totalRatings: 234,
    image:
      "https://sun9-45.userapi.com/s/v1/ig2/eCZXZvZZiWT3WKlpDE9ySZCulnYQPjFzFo-d64t3N6SlkE7YvnYWk1cSz2LF0200g_wjVbEbF9oQxehzFkTcFgK7.jpg?quality=95&as=32x21,48x32,72x48,108x72,160x107,240x160,360x240,480x320,540x360,640x426,720x480,1080x720,1280x853&from=bu&cs=1280x0",
    // СПОСОБ 1: YouTube видео - замените VIDEO_ID на ID вашего видео
    videoUrl:
      "https://rutube.ru/video/private/ef979358cee2909dcd1556bd07770e24/?p=9_eIH9rtuaKJsneEPwzOdA",
    videoType: "rutube",
  },
  {
    id: "2",
    title: "Креативные умы",
    host: "Майкл Чен",
    description:
      "Разговоры с художниками, дизайнерами и творческими профессионалами об их мастерстве.",
    fullDescription:
      "Присоединяйтесь к нам в вдохновляющем разговоре о творческом процессе. Наш гость делится своим путём от начинающего художника до успешного творческого профессионала, обсуждая вызовы, прорывы и важность сохранения верности своему художественному видению в коммерческом мире.",
    duration: "38 мин",
    publishDate: "18 февраля 2026",
    rating: 4.9,
    totalRatings: 189,
    image:
      "https://images.unsplash.com/photo-1653937049145-b37f88661a81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpbyUyMHJlY29yZGluZyUyMGVxdWlwbWVudHxlbnwxfHx8fDE3NzE4NDU2ODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    // СПОСОБ 2: Vimeo видео - замените VIDEO_ID на ID вашего видео
    videoUrl: "https://player.vimeo.com/video/76979871",
    videoType: "vimeo",
  },
  {
    id: "3",
    title: "Бизнес-прорыв",
    host: "Эмма Родригес",
    description:
      "Идеи и стратегии от успешных предпринимателей и бизнес-лидеров.",
    fullDescription:
      "Откройте для себя секреты построения успешного бизнеса в современном конкурентном ландшафте. Наш гость-предприниматель делится своей историей преодоления препятствий, масштабирования компании и ключевыми уроками, полученными на этом пути. Идеально подходит как для начинающих владельцев бизнеса, так и для опытных лидеров.",
    duration: "52 мин",
    publishDate: "15 февраля 2026",
    rating: 4.7,
    totalRatings: 312,
    image:
      "https://images.unsplash.com/photo-1533379007656-3a10925da2e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm9hZGNhc3RpbmclMjBoZWFkcGhvbmVzJTIwd29ya3NwYWNlfGVufDF8fHx8MTc3MTg0NTY4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    // СПОСОБ 3: HTML5 видео - используйте прямую ссылку на .mp4 файл
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    videoType: "mp4",
  },
];

export default function PodcastDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const podcast = podcastsData.find((p) => p.id === id);
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [averageRating, setAverageRating] = useState({
    average: 0,
    count: 0,
  });

  useEffect(() => {
    const loadRatings = async () => {
      if (id && currentUser) {
        const savedRating = await getUserRating(currentUser.id, id);
        if (savedRating !== null) {
          setUserRating(savedRating);
          setHasRated(true);
        }
      }

      if (id) {
        const avgRating = await getAverageRating(id);
        setAverageRating(avgRating);
      }
    };

    loadRatings();
  }, [id, currentUser]);

  if (!podcast) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-2xl">
          Подкаст не найден
        </div>
      </div>
    );
  }

  const handleRating = async (rating: number) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (currentUser && id) {
      setUserRating(rating);
      setHasRated(true);
      await saveRating(currentUser.id, id, rating);

      const avgRating = await getAverageRating(id);
      setAverageRating(avgRating);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-purple-200 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад к подкастам
        </Link>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
          <div className="aspect-video w-full bg-black">
            {podcast.videoType === "mp4" ? (
              // HTML5 видео плеер для .mp4 файлов
              <video
                className="w-full h-full"
                controls
                src={podcast.videoUrl}
              >
                Ваш браузер не поддерживает видео тег.
              </video>
            ) : (
              // iframe для YouTube и Vimeo
              <iframe
                className="w-full h-full"
                src={podcast.videoUrl}
                title={podcast.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>

          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-48 flex-shrink-0">
                <img
                  src={podcast.image}
                  alt={podcast.title}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>

              <div className="flex-1">
                <h1 className="text-4xl text-white mb-4">
                  {podcast.title}
                </h1>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-purple-200">
                    <User className="w-5 h-5" />
                    <span>{podcast.host}</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-200">
                    <Clock className="w-5 h-5" />
                    <span>{podcast.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-200">
                    <Calendar className="w-5 h-5" />
                    <span>{podcast.publishDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-white text-xl">
                      {averageRating.count > 0
                        ? averageRating.average
                        : podcast.rating}
                    </span>
                  </div>
                  <span className="text-purple-200">
                    (
                    {averageRating.count > 0
                      ? averageRating.count
                      : podcast.totalRatings}{" "}
                    оценок)
                  </span>
                </div>

                <p className="text-purple-100 mb-4">
                  {podcast.fullDescription}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/20">
              <h2 className="text-2xl text-white mb-4">
                {isAuthenticated
                  ? "Оцените этот подкаст"
                  : "Войдите, чтобы оценить подкаст"}
              </h2>
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        onMouseEnter={() =>
                          setHoveredRating(star)
                        }
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-10 h-10 ${
                            star <=
                            (hoveredRating || userRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-purple-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {hasRated && (
                    <span className="text-green-300 text-lg">
                      Спасибо за оценку! Вы поставили{" "}
                      {userRating}{" "}
                      {userRating === 1
                        ? "звезду"
                        : userRating >= 2 && userRating <= 4
                          ? "звезды"
                          : "звезд"}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex gap-4">
                  <Link
                    to="/login"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                  >
                    Войти
                  </Link>
                  <Link
                    to="/register"
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}