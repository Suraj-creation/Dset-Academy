import { useState, useEffect } from 'react';
import { withAuth } from '@/components/auth/withAuth';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { getAllPosts } from '@/lib/blog';

const Editor = dynamic(() => import('@tinymce/tinymce-react').then(m => m.Editor), { ssr: false });

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  imageUrl: string;
  publishedAt: string;
  author: string;
  status: 'draft' | 'published';
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  metaDescription?: string;
  slug: string;
}

const PRESET_TAGS = [
  { id: 'ai', name: 'AI & ML', color: '#2563eb' },
  { id: 'digital-transformation', name: 'Digital Transformation', color: '#7c3aed' },
  { id: 'business', name: 'Business Strategy', color: '#059669' },
  { id: 'leadership', name: 'Leadership', color: '#dc2626' },
  { id: 'technology', name: 'Technology', color: '#0891b2' },
  { id: 'innovation', name: 'Innovation', color: '#d97706' },
];

const EditBlogPost = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [metaDescription, setMetaDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        const posts = await getAllPosts();
        const foundPost = posts.find(p => p.id === id);
        
        if (foundPost) {
          setPost(foundPost);
          setTitle(foundPost.title);
          setSubtitle(foundPost.subtitle || '');
          setContent(foundPost.content);
          setPublishDate(foundPost.publishedAt.split('T')[0]);
          setImagePreview(foundPost.imageUrl);
          setSelectedTags(foundPost.tags?.map(tag => tag.id) || []);
          setMetaDescription(foundPost.metaDescription || '');
        } else {
          router.push('/admin/blog');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        router.push('/admin/blog');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchPost();
  }, [id, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = post?.imageUrl || '';
      
      // Only upload new image if one was selected
      if (image) {
        const formData = new FormData();
        formData.append('image', image);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const data = await response.json();
        imageUrl = data.url;
      }

      const updatedPost = {
        ...post,
        title,
        subtitle,
        content,
        imageUrl,
        publishedAt: new Date(publishDate).toISOString(),
        tags: selectedTags.map(tagId => PRESET_TAGS.find(tag => tag.id === tagId)).filter(Boolean),
        metaDescription,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      };

      // Update the post via API
      const response = await fetch(`/api/blog?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPost),
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      router.push('/admin/blog');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!post) {
    return <div className="min-h-screen flex items-center justify-center">Post not found</div>;
  }

  return (
    <>
      <Head>
        <title>Edit Blog Post | DSeT Consulting</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Blog Post</h1>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-900">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      required
                      placeholder="Enter post title"
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors text-black"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subtitle" className="text-black block text-sm font-semibold">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      id="subtitle"
                      placeholder="Enter post subtitle (optional)"
                      className="text-black block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors text-black"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <label htmlFor="publishDate" className="block text-sm font-semibold text-black">
                    Publish Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="publishDate"
                    required
                    className="block w-64 px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors text-black"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Featured Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-48 w-full object-cover rounded-lg shadow-sm"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Tags
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PRESET_TAGS.map(tag => (
                    <div
                      key={tag.id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedTags.includes(tag.id)
                          ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setSelectedTags(prev =>
                          prev.includes(tag.id)
                            ? prev.filter(id => id !== tag.id)
                            : [...prev, tag.id]
                        );
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {tag.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-colors resize-none text-black"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Brief description for SEO (recommended: 150-160 characters)"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Content <span className="text-red-500">*</span>
                </label>
                <div className="rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                  <Editor
                    apiKey={process.env.NEXT_PUBLIC_TINY_MCE_API_KEY}
                    init={{
                      height: 500,
                      menubar: true,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help',
                      content_style: `
                        body { 
                          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
                          font-size: 16px; 
                          line-height: 1.6; 
                          padding: 1rem; 
                          color: #000000; 
                        } 
                        p { 
                          color: #000000; 
                          margin-bottom: 1.5em;
                          font-size: 1.125rem;
                        } 
                        h1 { font-size: 2.25rem; font-weight: 700; color: #000000; margin-bottom: 1em; } 
                        h2 { font-size: 1.875rem; font-weight: 700; color: #000000; margin-bottom: 0.75em; } 
                        h3 { font-size: 1.5rem; font-weight: 700; color: #000000; margin-bottom: 0.75em; } 
                        h4 { font-size: 1.25rem; font-weight: 700; color: #000000; margin-bottom: 0.75em; } 
                        h5 { font-size: 1.125rem; font-weight: 700; color: #000000; margin-bottom: 0.75em; } 
                        h6 { font-size: 1rem; font-weight: 700; color: #000000; margin-bottom: 0.75em; }
                        ul, ol { 
                          margin-bottom: 1.5em;
                          padding-left: 1.25em;
                        }
                        li {
                          margin-bottom: 0.5em;
                          font-size: 1.125rem;
                        }
                        img {
                          max-width: 100%;
                          height: auto;
                          border-radius: 0.5rem;
                          margin: 1.5em 0;
                        }
                        strong { color: #000000; }
                        a { color: #2563eb; text-decoration: underline; }
                      `,
                      skin: 'oxide',
                      toolbar_sticky: true,
                    }}
                    value={content}
                    onEditorChange={setContent}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-8 border-t">
                <button
                  type="button"
                  onClick={() => router.push('/admin/blog')}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(EditBlogPost);