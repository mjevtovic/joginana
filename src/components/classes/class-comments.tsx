"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, Loader2, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { ClassComment } from "@/types/database";

interface ClassCommentsProps {
  classId: string;
  userId?: string;
  userName?: string;
}

export function ClassComments({ classId, userId, userName }: ClassCommentsProps) {
  const [comments, setComments] = useState<ClassComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [classId]);

  const fetchComments = async () => {
    const supabase = createClient();

    const { data, error: fetchError } = await supabase
      .from("class_comments")
      .select(`
        *,
        profile:profiles(full_name, avatar_url)
      `)
      .eq("class_id", classId)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Failed to fetch comments:", fetchError);
    } else {
      setComments(data || []);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !newComment.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    const supabase = createClient();

    try {
      // First insert the comment
      const { data: insertData, error: insertError } = await supabase
        .from("class_comments")
        .insert({
          class_id: classId,
          user_id: userId,
          body: newComment.trim(),
          status: "published",
        })
        .select("*")
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      // Add to comments with profile info
      const newCommentData = {
        ...insertData,
        profile: { full_name: userName || null, avatar_url: null },
      };

      setComments((prev) => [newCommentData, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Comment error:", err);
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const supabase = createClient();

    try {
      const { error: updateError } = await supabase
        .from("class_comments")
        .update({ status: "deleted" })
        .eq("id", commentId)
        .eq("user_id", userId);

      if (updateError) throw updateError;

      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {/* Comment Form */}
      {userId ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this class..."
                rows={3}
                maxLength={2000}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">
                  {newComment.length}/2000
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newComment.trim() || submitting}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </form>
      ) : (
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-gray-600 text-sm">
            Sign in to leave a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 p-4 bg-gray-50 rounded-xl"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center overflow-hidden">
                {comment.profile?.avatar_url ? (
                  <img
                    src={comment.profile.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-primary-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">
                      {comment.profile?.full_name || "Anonymous"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>

                  {comment.user_id === userId && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="mt-1 text-gray-700 whitespace-pre-wrap break-words">
                  {comment.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
