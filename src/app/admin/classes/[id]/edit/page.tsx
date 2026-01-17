"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, X, Trash2, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Difficulty, AccessType, YogaClass } from "@/types/database";

const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];
const ACCESS_TYPES: AccessType[] = ["free", "subscriber", "one_time"];
const STYLES = ["Vinyasa", "Hatha", "Yin", "Restorative", "Power", "Ashtanga", "Kundalini", "Prenatal"];
const FOCUS_TAGS = ["Flexibility", "Strength", "Balance", "Relaxation", "Core", "Back", "Hips", "Shoulders", "Full Body"];
const EQUIPMENT_TAGS = ["Mat", "Blocks", "Strap", "Bolster", "Blanket", "Chair", "Wall", "None"];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditClassPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructor: "",
    duration_minutes: 30,
    difficulty: "beginner" as Difficulty,
    style: "",
    video_url: "",
    thumbnail_url: "",
    access_type: "subscriber" as AccessType,
    one_time_price_cents: 499,
    currency: "EUR",
    focus_tags: [] as string[],
    equipment_tags: [] as string[],
    published: false,
  });

  const [stats, setStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    totalComments: 0,
  });

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const supabase = createClient();

        // Fetch class data
        const { data, error: fetchError } = await supabase
          .from("classes")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;

        const yogaClass = data as YogaClass;
        setFormData({
          title: yogaClass.title,
          description: yogaClass.description || "",
          instructor: yogaClass.instructor || "",
          duration_minutes: yogaClass.duration_minutes || 30,
          difficulty: yogaClass.difficulty || "beginner",
          style: yogaClass.style || "",
          video_url: yogaClass.video_url || "",
          thumbnail_url: yogaClass.thumbnail_url || "",
          access_type: yogaClass.access_type || "subscriber",
          one_time_price_cents: yogaClass.one_time_price_cents || 499,
          currency: yogaClass.currency || "EUR",
          focus_tags: yogaClass.focus_tags || [],
          equipment_tags: yogaClass.equipment_tags || [],
          published: yogaClass.published !== false,
        });

        // Fetch ratings stats
        const { data: ratingsData } = await supabase
          .from("class_ratings")
          .select("rating")
          .eq("class_id", id);

        if (ratingsData && ratingsData.length > 0) {
          const avgRating = ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length;
          setStats(prev => ({
            ...prev,
            averageRating: Math.round(avgRating * 10) / 10,
            totalRatings: ratingsData.length,
          }));
        }

        // Fetch comments count
        const { count: commentsCount } = await supabase
          .from("class_comments")
          .select("id", { count: "exact", head: true })
          .eq("class_id", id);

        if (commentsCount !== null) {
          setStats(prev => ({
            ...prev,
            totalComments: commentsCount,
          }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load class");
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [id]);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    setError(null);

    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("class-media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("class-media")
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, video_url: urlData.publicUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload video");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    setError(null);

    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("class-media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("class-media")
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, thumbnail_url: urlData.publicUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload thumbnail");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const toggleTag = (tag: string, type: "focus_tags" | "equipment_tags") => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].includes(tag)
        ? prev[type].filter((t) => t !== tag)
        : [...prev[type], tag],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();

      const classData = {
        title: formData.title,
        description: formData.description || null,
        instructor: formData.instructor || null,
        duration_minutes: formData.duration_minutes,
        difficulty: formData.difficulty,
        style: formData.style || null,
        video_url: formData.video_url || null,
        thumbnail_url: formData.thumbnail_url || null,
        access_type: formData.access_type,
        one_time_price_cents: formData.access_type === "one_time" ? formData.one_time_price_cents : null,
        currency: formData.currency,
        focus_tags: formData.focus_tags,
        equipment_tags: formData.equipment_tags,
        published: formData.published,
        is_premium: formData.access_type !== "free",
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("classes")
        .update(classData)
        .eq("id", id);

      if (updateError) throw updateError;

      router.push("/admin/classes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update class");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const supabase = createClient();

      const { error: deleteError } = await supabase
        .from("classes")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      router.push("/admin/classes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete class");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/classes"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Class</h1>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowDeleteConfirm(true)}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Class</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this class? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-xl font-semibold text-gray-900">
                {stats.averageRating > 0 ? (
                  <>
                    {stats.averageRating} <span className="text-sm font-normal text-gray-500">({stats.totalRatings} ratings)</span>
                  </>
                ) : (
                  <span className="text-gray-400">No ratings yet</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Comments</p>
              <p className="text-xl font-semibold text-gray-900">
                {stats.totalComments > 0 ? (
                  stats.totalComments
                ) : (
                  <span className="text-gray-400">No comments yet</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor
                </label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, instructor: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData((prev) => ({ ...prev, difficulty: e.target.value as Difficulty }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Style
                </label>
                <select
                  value={formData.style}
                  onChange={(e) => setFormData((prev) => ({ ...prev, style: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a style</option>
                  {STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Media</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video
              </label>
              {formData.video_url ? (
                <div className="flex items-center gap-4">
                  <video
                    src={formData.video_url}
                    className="w-48 h-28 object-cover rounded-lg"
                    controls
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData((prev) => ({ ...prev, video_url: "" }))}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingVideo ? (
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload video</p>
                        <p className="text-xs text-gray-400">MP4, WebM up to 500MB</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoUpload}
                    disabled={uploadingVideo}
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thumbnail
              </label>
              {formData.thumbnail_url ? (
                <div className="flex items-center gap-4">
                  <img
                    src={formData.thumbnail_url}
                    alt="Thumbnail"
                    className="w-48 h-28 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData((prev) => ({ ...prev, thumbnail_url: "" }))}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingThumbnail ? (
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload thumbnail</p>
                        <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailUpload}
                    disabled={uploadingThumbnail}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Areas
              </label>
              <div className="flex flex-wrap gap-2">
                {FOCUS_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag, "focus_tags")}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      formData.focus_tags.includes(tag)
                        ? "bg-primary-100 text-primary-700 border-2 border-primary-500"
                        : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Needed
              </label>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag, "equipment_tags")}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      formData.equipment_tags.includes(tag)
                        ? "bg-primary-100 text-primary-700 border-2 border-primary-500"
                        : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Access & Pricing */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Access & Pricing</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Type
              </label>
              <div className="flex gap-4">
                {ACCESS_TYPES.map((type) => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.access_type === type
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="access_type"
                      value={type}
                      checked={formData.access_type === type}
                      onChange={(e) => setFormData((prev) => ({ ...prev, access_type: e.target.value as AccessType }))}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">
                      {type === "free" && "Free"}
                      {type === "subscriber" && "Subscribers Only"}
                      {type === "one_time" && "One-Time Purchase"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {formData.access_type === "one_time" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (in cents)
                  </label>
                  <input
                    type="number"
                    min={99}
                    value={formData.one_time_price_cents}
                    onChange={(e) => setFormData((prev) => ({ ...prev, one_time_price_cents: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Display price: {(formData.one_time_price_cents / 100).toFixed(2)} {formData.currency}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Publishing */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Publish</h2>
              <p className="text-sm text-gray-500">Make this class visible to users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/classes">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={saving || !formData.title}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
