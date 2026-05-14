import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Star,
  Clock,
  User,
  Calendar,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  saveRating,
  getUserRating,
  getAverageRating,
} from "../utils/ratings";
import {
  addPodcastReview,
  getPodcastReviews,
  hasUserReviewedPodcast,
  type PodcastReview,
} from "../utils/podcastReviews";
import { deletePodcastReview, getAllPodcasts, type Podcast } from "../utils/podcasts";
import backgroundImage from "../../imports/maxresdefault.jpg";

export default function PodcastDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [averageRating, setAverageRating] = useState({
    average: 0,
    count: 0,
  });

  // Review state
  const [reviews, setReviews] = useState<PodcastReview[]>([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [hoveredReviewRating, setHoveredReviewRating] =
    useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Load podcast data from Supabase
      if (id) {
        const podcasts = await getAllPodcasts();
        const foundPodcast = podcasts.find((p) => p.id === id);
        setPodcast(foundPodcast || null);
      }

      if (id && currentUser) {
        const savedRating = await getUserRating(
          currentUser.id,
          id,
        );
        if (savedRating !== null) {
          setUserRating(savedRating);
          setHasRated(true);
        }

        const reviewed = await hasUserReviewedPodcast(
          currentUser.id,
          id,
        );
        setHasReviewed(reviewed);
      }

      if (id) {
        const avgRating = await getAverageRating(id);
        setAverageRating(avgRating);

        const podcastReviews = await getPodcastReviews(id);
        setReviews(podcastReviews);
      }

      setLoading(false);
    };

    loadData();
  }, [id, currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center" style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute inset-0 bg-black/75"></div>
        <div className="relative z-10 text-white text-2xl">
          Загрузка...
        </div>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="min-h-screen relative flex items-center justify-center" style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute inset-0 bg-black/75"></div>
        <div className="relative z-10 text-white text-2xl">
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
      console.log(`Setting user rating to ${rating}`);
      setUserRating(rating);
      setHasRated(true);

      const result = await saveRating(currentUser.id, id, rating);
      console.log('Save rating result:', result);

      if (result.success) {
        const avgRating = await getAverageRating(id);
        console.log('New average rating:', avgRating);
        setAverageRating(avgRating);
      } else {
        alert(`Ошибка сохранения рейтинга: ${result.message}`);
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !id) return;

    if (!reviewText.trim()) {
      alert("Пожалуйста, напишите отзыв");
      return;
    }

    if (reviewRating === 0) {
      alert("Пожалуйста, поставьте оценку");
      return;
    }

    const result = await addPodcastReview(
      currentUser.id,
      currentUser.fullName,
      id,
      reviewText,
      reviewRating,
    );

    if (result.success) {
      alert("Спасибо за ваш отзыв!");
      setHasReviewed(true);
      setShowReviewForm(false);
      setReviewText("");
      setReviewRating(0);

      // Reload reviews
      const podcastReviews = await getPodcastReviews(id);
      setReviews(podcastReviews);
    } else {
      alert(result.message);
    }
  };

  const formatReviewDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!currentUser?.isAdmin) return;

    if (!confirm("Вы уверены, что хотите удалить этот отзыв?")) {
      return;
    }

    const result = await deletePodcastReview(reviewId);
    if (result.success) {
      alert("Отзыв успешно удалён");
      if (id) {
        const updatedReviews = await getPodcastReviews(id);
        setReviews(updatedReviews);
      }
    } else {
      alert(result.message);
    }
  };

  // Helper function to convert YouTube URL to embed format
  const getEmbedUrl = (url: string, type: string) => {
    if (!url) return "";

    if (type === "youtube") {
      // Handle various YouTube URL formats
      const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (videoIdMatch && videoIdMatch[1]) {
        return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
      }
      // If already an embed URL, return as is
      if (url.includes('/embed/')) {
        return url;
      }
    }

    // For other types or if no conversion needed, return original URL
    return url;
  };

  return (
    <div className="min-h-screen relative" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-black/75"></div>
      <div className="relative z-10">
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
            {!podcast.videoUrl ? (
              // Сообщение если видео не добавлено
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-purple-200 px-4">
                  <p className="text-xl mb-2">Видео ещё не добавлено</p>
                  <p className="text-sm opacity-70">Скоро здесь появится видео подкаста</p>
                </div>
              </div>
            ) : podcast.videoType === "mp4" ? (
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
                src={getEmbedUrl(podcast.videoUrl, podcast.videoType)}
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
                      {averageRating.average || 0}
                    </span>
                  </div>
                  <span className="text-purple-200">
                    ({averageRating.count}{" "}
                    {averageRating.count === 1
                      ? "оценка"
                      : averageRating.count >= 2 &&
                          averageRating.count <= 4
                        ? "оценки"
                        : "оценок"}
                    )
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
                    className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-amber-500/50 transition-all"
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

            {/* Reviews Section */}
            <div className="mt-8 pt-8 border-t border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-white flex items-center gap-3">
                  <MessageSquare className="w-7 h-7" />
                  Отзывы ({reviews.length})
                </h2>
                {isAuthenticated && !hasReviewed && (
                  <button
                    onClick={() =>
                      setShowReviewForm(!showReviewForm)
                    }
                    className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-amber-500/50 transition-all"
                  >
                    {showReviewForm
                      ? "Отменить"
                      : "Написать отзыв"}
                  </button>
                )}
              </div>

              {/* Review Form */}
              {isAuthenticated &&
                !hasReviewed &&
                showReviewForm && (
                  <form
                    onSubmit={handleSubmitReview}
                    className="bg-white/5 rounded-xl p-6 mb-6"
                  >
                    <div className="mb-4">
                      <label className="block text-sm text-purple-200 mb-2">
                        Ваша оценка
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              setReviewRating(star)
                            }
                            onMouseEnter={() =>
                              setHoveredReviewRating(star)
                            }
                            onMouseLeave={() =>
                              setHoveredReviewRating(0)
                            }
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <=
                                (hoveredReviewRating ||
                                  reviewRating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-purple-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="reviewText"
                        className="block text-sm text-purple-200 mb-2"
                      >
                        Ваш отзыв
                      </label>
                      <textarea
                        id="reviewText"
                        value={reviewText}
                        onChange={(e) =>
                          setReviewText(e.target.value)
                        }
                        className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors min-h-[120px]"
                        placeholder="Расскажите, что вы думаете об этом подкасте..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-amber-500/50 transition-all"
                    >
                      Отправить отзыв
                    </button>
                  </form>
                )}

              {hasReviewed && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
                  <p className="text-green-300">
                    Вы уже оставили отзыв к этому подкасту.
                    Спасибо!
                  </p>
                </div>
              )}

              {!isAuthenticated && (
                <div className="bg-white/5 rounded-xl p-6 text-center mb-6">
                  <p className="text-purple-200 mb-4">
                    Войдите, чтобы оставить отзыв
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link
                      to="/login"
                      className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-amber-500/50 transition-all"
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
                </div>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                  <p className="text-purple-200 text-lg">
                    Пока нет отзывов. Станьте первым!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white/5 rounded-xl p-6 border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg text-white mb-1">
                            {review.userName}
                          </h3>
                          <p className="text-amber-400 text-sm">
                            {formatReviewDate(review.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-purple-300"
                                }`}
                              />
                            ))}
                          </div>
                          {currentUser?.isAdmin && (
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors"
                              title="Удалить отзыв"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-white">
                        {review.reviewText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}