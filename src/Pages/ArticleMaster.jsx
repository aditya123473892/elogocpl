import React, { useState, useEffect } from "react";
import { articleMasterAPI } from "../utils/Api";
import { Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ARTICLE_GROUPS = [
  "Hatchback",
  "Sedan",
  "SUV",
  "Commercial",
  "Other",
];

const ArticleMaster = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleGroups, setArticleGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    article_code: "",
    article_name: "",
    article_group: "Hatchback",
    article_length: "",
    article_width: "",
    article_height: "",
    article_image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch articles from API
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await articleMasterAPI.getAllArticles();
      if (data.success) {
        setArticles(data.data);
        setFilteredArticles(data.data);
      } else {
        setError(data.message || 'Failed to fetch articles');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch article groups from API
  const fetchArticleGroups = async () => {
    try {
      const data = await articleMasterAPI.getArticleGroups();
      if (data.success) {
        setArticleGroups(data.data);
      }
    } catch (err) {
      console.error('Error fetching article groups:', err);
      // Fallback to default groups
      setArticleGroups(["Hatchback", "Sedan", "SUV", "Commercial", "Other"]);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchArticleGroups();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, article_image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    resetForm();
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.article_code.trim()) {
      toast.error('Article Code is required!');
      return;
    }
    if (!formData.article_name.trim()) {
      toast.error('Article Name is required!');
      return;
    }
    if (!formData.article_group.trim()) {
      toast.error('Article Group is required!');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('article_code', formData.article_code);
      formDataToSend.append('article_name', formData.article_name);
      formDataToSend.append('article_group', formData.article_group);
      formDataToSend.append('article_length', formData.article_length);
      formDataToSend.append('article_width', formData.article_width);
      formDataToSend.append('article_height', formData.article_height);
      
      if (formData.article_image instanceof File) {
        formDataToSend.append('article_image', formData.article_image);
        console.log("Frontend - Sending image file:", {
          name: formData.article_image.name,
          size: formData.article_image.size,
          type: formData.article_image.type
        });
      } else {
        console.log("Frontend - No image file to send");
      }

      console.log("Frontend - FormData contents:");
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(key, `File: ${value.name} (${value.size} bytes)`);
        } else {
          console.log(key, value);
        }
      }

      let data;
      if (selectedArticle) {
        // Update existing article
        console.log("Frontend - Updating article:", selectedArticle.article_id);
        data = await articleMasterAPI.updateArticle(selectedArticle.article_id, formDataToSend);
      } else {
        // Create new article
        console.log("Frontend - Creating new article");
        data = await articleMasterAPI.createArticle(formDataToSend);
      }

      console.log("Frontend - API Response:", data);
      if (data.success) {
        await fetchArticles(); // Refresh the list
        resetForm();
        toast.success(selectedArticle ? 'Article updated successfully!' : 'Article created successfully!');
      } else {
        toast.error(data.message || 'Failed to save article');
      }
    } catch (err) {
      console.error('Error saving article:', err);
      toast.error('Error saving article: ' + err.message);
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
    });
    setImagePreview(null);
    setSelectedArticle(null);
  };

  const handleArticleSelect = (article) => {
    setSelectedArticle(article);
    setFormData({
      article_code: article.article_code,
      article_name: article.article_name,
      article_group: article.article_group,
      article_length: article.article_length,
      article_width: article.article_width,
      article_height: article.article_height,
      article_image: null, // Don't set the file object, just the preview
    });
    setImagePreview(article.article_image_binary ? `data:image/jpeg;base64,${article.article_image_binary}` : null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        const data = await articleMasterAPI.deleteArticle(id);
        if (data.success) {
          await fetchArticles(); // Refresh the list
          if (selectedArticle?.article_id === id) {
            resetForm();
          }
          toast.success('Article deleted successfully!');
        } else {
          toast.error(data.message || 'Failed to delete article');
        }
      } catch (err) {
        console.error('Error deleting article:', err);
        toast.error('Error deleting article: ' + err.message);
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm">
              <span className="text-green-600 cursor-pointer hover:text-green-700">Home</span>
              <span className="mx-2 text-gray-400">›</span>
              <span className="text-gray-900 font-medium">Article Master</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAdd}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
              >
                New Article
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
              >
                {selectedArticle ? 'Update Article' : 'Create Article'}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex">
          {/* Form Section - LEFT */}
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Form Fields */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                {/* Article Code */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Article Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="article_code"
                    value={formData.article_code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-100"
                    placeholder="YE311"
                  />
                </div>

                {/* Article Name */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Article Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="article_name"
                    value={formData.article_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-100"
                    placeholder="ALTO"
                  />
                </div>

                {/* Article Group */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Article Group</label>
                  <select
                    name="article_group"
                    value={formData.article_group}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    {articleGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Article Length */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Article Length</label>
                  <input
                    type="text"
                    name="article_length"
                    value={formData.article_length}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-100"
                    placeholder="3430"
                  />
                </div>

                {/* Article Width */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Article Width</label>
                  <input
                    type="text"
                    name="article_width"
                    value={formData.article_width}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-100"
                    placeholder="1490"
                  />
                </div>

                {/* Article Height */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Article Height</label>
                  <input
                    type="text"
                    name="article_height"
                    value={formData.article_height}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-100"
                    placeholder="1475"
                  />
                </div>

                {/* Article Image */}
                <div className="col-span-3">
                  <label className="block text-sm text-gray-700 mb-2">Article Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="flex justify-center mt-6">
                  <div className="w-96 h-96 border-4 border-gray-200 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-lg">
                    <img
                      src={imagePreview}
                      alt="Article Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {!imagePreview && (
                <div className="flex justify-center mt-6">
                  <div className="w-96 h-96 border-4 border-gray-200 rounded-full flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400">No image selected</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Article List Sidebar - RIGHT */}
          <div
            className="w-80 bg-white border-l border-gray-200 overflow-hidden flex flex-col"
            style={{ maxHeight: "calc(100vh - 70px)" }}
          >
            <div className="bg-gray-700 text-white text-center py-3 font-medium">
              Article List
            </div>
            <div className="flex-1 overflow-y-auto bg-white">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-gray-500">Loading articles...</div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-red-500">Error: {error}</div>
                </div>
              ) : (
                filteredArticles.map((article) => (
                  <div
                    key={article.article_id}
                    className={`border-b border-gray-200 transition-colors ${
                      selectedArticle?.article_id === article.article_id
                        ? "bg-gray-700 text-white"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    <div className="px-4 py-3 flex items-center justify-between cursor-pointer">
                      <div
                        onClick={() => handleArticleSelect(article)}
                        className={`text-sm flex-1 ${
                          selectedArticle?.article_id === article.article_id
                            ? "text-white font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {article.article_name}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(article.article_id);
                        }}
                        className={`transition-colors ml-2 ${
                          selectedArticle?.article_id === article.article_id
                            ? "text-red-300 hover:text-red-100"
                            : "text-red-500 hover:text-red-700"
                        }`}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default ArticleMaster;