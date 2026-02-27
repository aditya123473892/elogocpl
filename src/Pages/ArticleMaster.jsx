import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Package, X, Check, Camera } from "lucide-react";
import { articleMasterAPI } from "../utils/Api";

const ARTICLE_GROUPS = ["Hatchback", "Sedan", "SUV", "Commercial", "Other"];

const ArticleMaster = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleGroups, setArticleGroups] = useState(ARTICLE_GROUPS);
  const [formData, setFormData] = useState({
    article_code: "",
    article_name: "",
    article_group: "Hatchback",
    article_length: "",
    article_width: "",
    article_height: "",
    article_image: null,
    imagePreview: null,
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchArticles();
    fetchArticleGroups();
  }, []);

  useEffect(() => {
    const filtered = articles.filter(
      (article) =>
        article.article_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.article_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.article_group &&
          article.article_group.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredArticles(filtered);
  }, [searchTerm, articles]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await articleMasterAPI.getAllArticles();
      if (data.success) {
        setArticles(data.data || []);
        setFilteredArticles(data.data || []);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to fetch articles" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to fetch articles" });
    } finally {
      setLoading(false);
    }
  };

  const fetchArticleGroups = async () => {
    try {
      const data = await articleMasterAPI.getArticleGroups();
      if (data.success) setArticleGroups(data.data);
    } catch {
      setArticleGroups(ARTICLE_GROUPS);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.article_code.trim()) newErrors.article_code = "Article code is required";
    if (!formData.article_name.trim()) newErrors.article_name = "Article name is required";
    if (!formData.article_group) newErrors.article_group = "Article group is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const formDataToSend = new FormData();
      formDataToSend.append("article_code", formData.article_code);
      formDataToSend.append("article_name", formData.article_name);
      formDataToSend.append("article_group", formData.article_group);
      formDataToSend.append("article_length", formData.article_length);
      formDataToSend.append("article_width", formData.article_width);
      formDataToSend.append("article_height", formData.article_height);
      if (formData.article_image instanceof File) {
        formDataToSend.append("article_image", formData.article_image);
      }

      let data;
      if (editingArticle) {
        data = await articleMasterAPI.updateArticle(editingArticle.article_id, formDataToSend);
        setMessage({ type: "success", text: "Article updated successfully" });
      } else {
        data = await articleMasterAPI.createArticle(formDataToSend);
        setMessage({ type: "success", text: "Article created successfully" });
      }

      if (data.success) {
        resetForm();
        fetchArticles();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to save article" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to save article" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      article_code: article.article_code,
      article_name: article.article_name,
      article_group: article.article_group,
      article_length: article.article_length || "",
      article_width: article.article_width || "",
      article_height: article.article_height || "",
      article_image: null,
      imagePreview: article.article_image_binary
        ? `data:image/jpeg;base64,${article.article_image_binary}`
        : null,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;

    try {
      setLoading(true);
      const data = await articleMasterAPI.deleteArticle(id);
      if (data.success) {
        setMessage({ type: "success", text: "Article deleted successfully" });
        fetchArticles();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to delete article" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to delete article" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      article_code: "",
      article_name: "",
      article_group: "Hatchback",
      article_length: "",
      article_width: "",
      article_height: "",
      article_image: null,
      imagePreview: null,
    });
    setEditingArticle(null);
    setErrors({});
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size should be less than 5MB" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select an image file" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, article_image: file, imagePreview: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, article_image: null, imagePreview: null }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Article Master Management</h1>
        <p className="text-gray-600">Manage vehicle articles including hatchbacks, sedans, SUVs, and more</p>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            {message.type === "success" ? (
              <Check className="w-5 h-5 mr-2" />
            ) : (
              <X className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
          <button
            onClick={() => setMessage({ type: "", text: "" })}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-md">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Article
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading articles...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                {searchTerm ? "No articles found matching your search" : "No articles found"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dimensions (L × W × H)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredArticles.map((article) => (
                  <tr key={article.article_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {article.article_code}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{article.article_name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {article.article_group}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {article.article_length || article.article_width || article.article_height
                          ? `${article.article_length || "-"} × ${article.article_width || "-"} × ${article.article_height || "-"}`
                          : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {article.article_image_binary ? (
                        <img
                          src={`data:image/jpeg;base64,${article.article_image_binary}`}
                          alt={article.article_name}
                          className="h-10 w-10 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='8' fill='%239ca3af'%3ENo Img%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(article)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(article.article_id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingArticle ? "Edit Article" : "Add New Article"}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Article Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="article_code"
                    value={formData.article_code}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.article_code ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g. YE311"
                  />
                  {errors.article_code && (
                    <p className="mt-1 text-sm text-red-600">{errors.article_code}</p>
                  )}
                </div>

                {/* Article Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="article_name"
                    value={formData.article_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.article_name ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g. ALTO"
                  />
                  {errors.article_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.article_name}</p>
                  )}
                </div>

                {/* Article Group */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article Group <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="article_group"
                    value={formData.article_group}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.article_group ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select group</option>
                    {articleGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                  {errors.article_group && (
                    <p className="mt-1 text-sm text-red-600">{errors.article_group}</p>
                  )}
                </div>

                {/* Dimensions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimensions (mm)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      name="article_length"
                      value={formData.article_length}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Length"
                    />
                    <input
                      type="text"
                      name="article_width"
                      value={formData.article_width}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Width"
                    />
                    <input
                      type="text"
                      name="article_height"
                      value={formData.article_height}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Height"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article Image
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        id="article-image-upload"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="article-image-upload"
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Choose Image
                      </label>
                      {formData.imagePreview && (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {formData.imagePreview && (
                      <div className="mt-2">
                        <img
                          src={formData.imagePreview}
                          alt="Article preview"
                          className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Saving..." : editingArticle ? "Update Article" : "Create Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleMaster;