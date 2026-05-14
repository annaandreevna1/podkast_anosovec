import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Star, AlertCircle, Lightbulb, ThumbsUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { addFeedback, hasUserSubmittedFeedback } from "../utils/feedback";
import backgroundImage from "../../imports/maxresdefault.jpg";

export default function FeedbackPage() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    hasProblems: false,
    problems: "",
    recommendations: "",
    rating: 0,
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkFeedback = async () => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      if (currentUser) {
        const submitted = await hasUserSubmittedFeedback(currentUser.id);
        setHasSubmitted(submitted);
      }
    };

    checkFeedback();
  }, [currentUser, isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.hasProblems && !formData.problems.trim()) {
      newErrors.problems = "Пожалуйста, опишите проблемы";
    }

    if (!formData.recommendations.trim()) {
      newErrors.recommendations = "Пожалуйста, оставьте рекомендации";
    }

    if (formData.rating === 0) {
      newErrors.rating = "Пожалуйста, поставьте оценку";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    if (validateForm()) {
      const result = await addFeedback(
        currentUser.id,
        currentUser.fullName,
        currentUser.email,
        formData.hasProblems,
        formData.problems,
        formData.recommendations,
        formData.rating
      );

      if (result.success) {
        alert("Спасибо за ваш отзыв!");
        navigate("/");
      } else {
        alert(result.message);
      }
    }
  };

  if (hasSubmitted) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4 py-8" style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute inset-0 bg-black/75"></div>
        <div className="relative z-10 w-full max-w-2xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад к подкастам
          </Link>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center">
            <ThumbsUp className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-3xl text-white mb-4">Спасибо за ваш отзыв!</h1>
            <p className="text-purple-200 mb-6">
              Вы уже оставили отзыв о работе системы. Мы ценим ваше мнение!
            </p>
            <Link
              to="/"
              className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-amber-500/50 transition-all"
            >
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative px-4 py-8" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-black/75"></div>
      <div className="relative z-10 max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-purple-200 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад к подкастам
        </Link>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl text-white mb-2">Отзыв о работе системы</h1>
            <p className="text-purple-200">
              Помогите нам улучшить систему подкастов
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Вопрос 1: Проблемы */}
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl text-white mb-4">
                    Возникали ли проблемы с использованием системы?
                  </h2>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-purple-200 cursor-pointer">
                      <input
                        type="radio"
                        name="hasProblems"
                        checked={!formData.hasProblems}
                        onChange={() =>
                          setFormData((prev) => ({ ...prev, hasProblems: false, problems: "" }))
                        }
                        className="w-4 h-4"
                      />
                      <span>Нет, всё работает отлично</span>
                    </label>
                    <label className="flex items-center gap-3 text-purple-200 cursor-pointer">
                      <input
                        type="radio"
                        name="hasProblems"
                        checked={formData.hasProblems}
                        onChange={() =>
                          setFormData((prev) => ({ ...prev, hasProblems: true }))
                        }
                        className="w-4 h-4"
                      />
                      <span>Да, были проблемы</span>
                    </label>
                  </div>

                  {formData.hasProblems && (
                    <div className="mt-4">
                      <label htmlFor="problems" className="block text-sm text-purple-200 mb-2">
                        Опишите проблемы:
                      </label>
                      <textarea
                        id="problems"
                        value={formData.problems}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, problems: e.target.value }))
                        }
                        className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors min-h-[100px]"
                        placeholder="Подробно опишите проблемы, с которыми вы столкнулись..."
                      />
                      {errors.problems && (
                        <p className="text-red-300 text-sm mt-1">{errors.problems}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Вопрос 2: Рекомендации */}
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl text-white mb-4">
                    Рекомендации по усовершенствованию системы
                  </h2>
                  <textarea
                    value={formData.recommendations}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, recommendations: e.target.value }))
                    }
                    className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors min-h-[120px]"
                    placeholder="Какие функции или улучшения вы хотели бы видеть в системе?"
                  />
                  {errors.recommendations && (
                    <p className="text-red-300 text-sm mt-1">{errors.recommendations}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Вопрос 3: Оценка */}
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Star className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl text-white mb-4">Оцените систему</h2>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-12 h-12 ${
                            star <= (hoveredRating || formData.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-purple-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {formData.rating > 0 && (
                    <p className="text-purple-200 mt-3">
                      Ваша оценка: {formData.rating}{" "}
                      {formData.rating === 1
                        ? "звезда"
                        : formData.rating >= 2 && formData.rating <= 4
                        ? "звезды"
                        : "звезд"}
                    </p>
                  )}
                  {errors.rating && (
                    <p className="text-red-300 text-sm mt-1">{errors.rating}</p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-lg font-bold hover:shadow-lg hover:shadow-amber-500/50 transition-all text-lg"
            >
              Отправить отзыв
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
