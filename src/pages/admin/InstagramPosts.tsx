import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Instagram, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { InstagramPost } from '@/hooks/useInstagramPosts';

interface FormData {
  image_url: string;
  caption: string;
  permalink: string;
  media_type: 'IMAGE' | 'VIDEO';
  sort_order: number;
}

const emptyForm: FormData = {
  image_url: '',
  caption: '',
  permalink: '',
  media_type: 'IMAGE',
  sort_order: 0,
};

export default function AdminInstagramPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('instagram_posts')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      setPosts(
        (data ?? []).map((p) => ({
          id: p.id,
          image_url: p.image_url,
          caption: p.caption ?? undefined,
          permalink: p.permalink,
          media_type: (p.media_type ?? 'IMAGE') as 'IMAGE' | 'VIDEO',
          sort_order: p.sort_order ?? 0,
        }))
      );
    } catch (error) {
      console.error('Error fetching Instagram posts:', error);
      toast.error('Failed to load Instagram posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url.trim() || !formData.permalink.trim()) {
      toast.error('Image URL and permalink are required');
      return;
    }

    setSaving(true);
    try {
      if (editingPost) {
        const { error } = await supabase
          .from('instagram_posts')
          .update({
            image_url: formData.image_url.trim(),
            caption: formData.caption.trim() || null,
            permalink: formData.permalink.trim(),
            media_type: formData.media_type,
            sort_order: formData.sort_order,
          })
          .eq('id', editingPost.id);

        if (error) throw error;
        toast.success('Post updated');
      } else {
        const payload = {
          image_url: formData.image_url.trim(),
          caption: formData.caption.trim() || null,
          permalink: formData.permalink.trim(),
          media_type: formData.media_type,
          sort_order: formData.sort_order,
        };
        const { error } = await supabase.from('instagram_posts').insert(payload);

        if (error) throw error;
        toast.success('Post added');
      }

      setFormData(emptyForm);
      setEditingPost(null);
      await fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (post: InstagramPost) => {
    setEditingPost(post);
    setFormData({
      image_url: post.image_url,
      caption: post.caption ?? '',
      permalink: post.permalink,
      media_type: post.media_type,
      sort_order: post.sort_order,
    });
    // Scroll to form
    document.getElementById('instagram-post-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this Instagram post?')) return;

    try {
      const { error } = await supabase.from('instagram_posts').delete().eq('id', id);

      if (error) throw error;
      toast.success('Post deleted');
      await fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const closeEditDialog = () => {
    setEditingPost(null);
    setFormData(emptyForm);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="pt-24 pb-16 min-h-screen bg-cream flex items-center justify-center">
            <div className="text-center">Loading Instagram posts...</div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="pt-24 pb-16 min-h-screen bg-cream">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/dashboard')}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>

            <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2">
              Instagram Moments
            </h1>
            <p className="text-muted-foreground mb-8">
              Manage hand-picked Instagram posts for the homepage carousel.
            </p>

            {/* Add/Edit form */}
            <form
              id="instagram-post-form"
              onSubmit={handleSubmit}
              className="bg-background border border-border rounded-lg p-6 mb-8"
            >
              <h2 className="font-semibold text-lg mb-4">
                {editingPost ? 'Edit Post' : 'Add Post'}
              </h2>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="image_url">Image URL (public link)</Label>
                  <Input
                    id="image_url"
                    type="url"
                    placeholder="https://..."
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, image_url: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="permalink">Instagram Permalink</Label>
                  <Input
                    id="permalink"
                    type="url"
                    placeholder="https://www.instagram.com/p/ABC123/"
                    value={formData.permalink}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, permalink: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="caption">Caption</Label>
                  <textarea
                    id="caption"
                    placeholder="Caption with @mentions and #hashtags..."
                    value={formData.caption}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, caption: e.target.value }))
                    }
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                    rows={3}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="media_type">Media Type</Label>
                    <select
                      id="media_type"
                      value={formData.media_type}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          media_type: e.target.value as 'IMAGE' | 'VIDEO',
                        }))
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="IMAGE">Image</option>
                      <option value="VIDEO">Video</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      min={0}
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sort_order: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    {editingPost ? 'Update Post' : 'Add Post'}
                  </Button>
                  {editingPost && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeEditDialog}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </form>

            {/* Posts list */}
            <div>
              <h2 className="font-semibold text-lg mb-4">Posts ({posts.length})</h2>
              {posts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                  <Instagram className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No Instagram posts yet.</p>
                  <p className="text-sm mt-1">Add your first post above.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center gap-4 bg-background border border-border rounded-lg p-4"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                        <img
                          src={post.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect fill="%23ddd" width="64" height="64"/><text x="50%" y="50%" fill="%23999" text-anchor="middle" dy=".3em" font-size="10">?</text></svg>';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground truncate">
                          {post.caption || '(no caption)'}
                        </p>
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline truncate block"
                        >
                          {post.permalink}
                        </a>
                        <span className="text-xs text-muted-foreground">
                          {post.media_type} · Order: {post.sort_order}
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(post)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(post.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
