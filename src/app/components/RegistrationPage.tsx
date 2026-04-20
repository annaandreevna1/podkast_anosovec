import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { registerUser, loginUser } from "../utils/auth";
import { useAuth } from "../context/AuthContext";

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Очистить ошибку когда пользователь начинает печатать
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Полное имя обязательно";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email обязателен";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Введите корректный email";
    }

    if (!formData.password) {
      newErrors.password = "Пароль обязателен";
    } else if (formData.password.length < 8) {
      newErrors.password = "Пароль должен содержать минимум 8 символов";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Подтвердите ваш пароль";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const result = await registerUser(formData.email, formData.password, formData.fullName);

      if (result.success && result.user) {
        setCurrentUser(result.user);
        navigate("/");
      } else {
        setErrors({ email: result.message });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-purple-200 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад к подкастам
        </Link>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl text-white mb-2">Создать аккаунт</h1>
            <p className="text-purple-200">Присоединяйтесь к нашему сообществу подкастов</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm text-purple-200 mb-2">
                Полное имя
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-12 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Введите ваше полное имя"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-300 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-purple-200 mb-2">
                Email адрес
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-12 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Введите ваш email"
                />
              </div>
              {errors.email && (
                <p className="text-red-300 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-purple-200 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-12 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Создайте пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-300 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-purple-200 mb-2">
                Подтвердите пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-12 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Подтвердите ваш пароль"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-300 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Создать аккаунт
            </button>
          </form>

          <p className="text-center text-purple-200 mt-6">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="text-purple-300 hover:text-white transition-colors underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
