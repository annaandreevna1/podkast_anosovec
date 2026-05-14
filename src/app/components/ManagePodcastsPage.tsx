import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getAllPodcasts,
  addPodcast,
  updatePodcast,
  deletePodcast,
  type Podcast,
} from "../utils/podcasts";
import backgroundImage from "../../imports/maxresdefault.jpg";

export default function ManagePodcastsPage() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    host: "",
    description: "",
    fullDescription: "",
    duration: "",
    publishDate: "",
    image: "",
    videoUrl: "",
    videoType: "mp4",
  });

  useEffect(() => {
    if (!isAuthenticated || !currentUser?.isAdmin) {
      navigate("/");
      return;
    }

    loadPodcasts();
  }, [isAuthenticated, currentUser, navigate]);

  const loadPodcasts = async () => {
    setLoading(true);
    const data = await getAllPodcasts();
    setPodcasts(data);
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.host || !formData.description) {
      alert("Заполните обязательные поля");
      return;
    }

    if (editingId) {
      const result = await updatePodcast(editingId, formData);
      if (result.success) {
        alert("Подкаст успешно обновлён");
        resetForm();
        loadPodcasts();
      } else {
        alert(result.message);
      }
    } else {
      const result = await addPodcast(formData);
      if (result.success) {
        alert("Подкаст успешно добавлен");
        resetForm();
        loadPodcasts();
      } else {
        alert(result.message);
      }
    }
  };

  const handleEdit = (podcast: Podcast) => {
    setEditingId(podcast.id);
    setFormData({
      title: podcast.title,
      host: podcast.host,
      description: podcast.description,
      fullDescription: podcast.fullDescription,
      duration: podcast.duration,
      publishDate: podcast.publishDate,
      image: podcast.image,
      videoUrl: podcast.videoUrl,
      videoType: podcast.videoType,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Вы уверены, что хотите удалить подкаст "${title}"?`)) {
      return;
    }

    const result = await deletePodcast(id);
    if (result.success) {
      alert("Подкаст успешно удалён");
      loadPodcasts();
    } else {
      alert(result.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      host: "",
      description: "",
      fullDescription: "",
      duration: "",
      publishDate: "",
      image: "",
      videoUrl: "",
      videoType: "mp4",
    });
    setEditingId(null);
    setShowAddForm(false);
  };

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
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад к админ-панели
          </Link>

          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-amber-500/50 transition-all"
          >
            <Plus className="w-5 h-5" />
            Добавить подкаст
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl text-white mb-2">Управление подкастами</h1>
          <p className="text-purple-200">Добавление, редактирование и удаление подкастов</p>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl text-white">
                {editingId ? "Редактировать подкаст" : "Добавить подкаст"}
              </h2>
              <button
                onClick={resetForm}
                className="text-purple-200 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-purple-200 mb-2">
                    Название *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="Введите название подкаста"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-purple-200 mb-2">
                    Ведущий *
                  </label>
                  <input
                    type="text"
                    name="host"
                    value={formData.host}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="Введите имя ведущего"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-purple-200 mb-2">
                    Длительность
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="12 мин"
                  />
                </div>

                <div>
                  <label className="block text-sm text-purple-200 mb-2">
                    Дата публикации
                  </label>
                  <input
                    type="text"
                    name="publishDate"
                    value={formData.publishDate}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="14 мая 2026"
                  />
                </div>

                <div>
                  <label className="block text-sm text-purple-200 mb-2">
                    URL обложки
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-purple-200 mb-2">
                    URL видео
                  </label>
                  <input
                    type="text"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors"
                    placeholder="https://www.youtube.com/watch?v=... или https://..."
                  />
                  <p className="text-purple-300/70 text-xs mt-1">
                    Примеры: youtube.com/watch?v=..., youtu.be/..., vimeo.com/...
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-purple-200 mb-2">
                  Тип видео
                </label>
                <select
                  name="videoType"
                  value={formData.videoType}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-purple-400 transition-colors"
                >
                  <option value="mp4">MP4 (прямая ссылка)</option>
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="vm-fb">VM-FB</option>
                </select>
                <p className="text-purple-300/70 text-xs mt-1">
                  Для YouTube используйте обычную ссылку (будет автоматически преобразована в embed)
                </p>
              </div>

              <div>
                <label className="block text-sm text-purple-200 mb-2">
                  Краткое описание *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Краткое описание подкаста"
                  rows={2}
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm text-purple-200 mb-2">
                  Полное описание
                </label>
                <textarea
                  name="fullDescription"
                  value={formData.fullDescription}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Полное описание подкаста"
                  rows={4}
                ></textarea>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-amber-500/50 transition-all"
                >
                  <Save className="w-5 h-5" />
                  {editingId ? "Сохранить изменения" : "Добавить подкаст"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Podcasts List */}
        <div className="space-y-4">
          {podcasts.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
              <p className="text-purple-200 text-lg">Нет подкастов</p>
            </div>
          ) : (
            podcasts.map((podcast) => (
              <div
                key={podcast.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10"
              >
                <div className="flex items-start gap-4">
                  {podcast.image && (
                    <img
                      src={podcast.image}
                      alt={podcast.title}
                      className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl text-white mb-2">{podcast.title}</h3>
                    <p className="text-purple-200 text-sm mb-2">
                      Ведущий: {podcast.host}
                    </p>
                    <p className="text-purple-100/80 text-sm mb-2">
                      {podcast.description}
                    </p>
                    <div className="flex gap-4 text-purple-300 text-sm mb-2">
                      <span>{podcast.duration}</span>
                      <span>{podcast.publishDate}</span>
                    </div>
                    {podcast.videoUrl && (
                      <div className="flex items-center gap-2 text-purple-300/70 text-xs">
                        <span className="bg-purple-500/20 px-2 py-1 rounded">
                          {podcast.videoType.toUpperCase()}
                        </span>
                        <span className="truncate max-w-xs" title={podcast.videoUrl}>
                          {podcast.videoUrl}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(podcast)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      title="Редактировать"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(podcast.id, podcast.title)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}