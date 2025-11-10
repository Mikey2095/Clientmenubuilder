import { useState, useEffect } from 'react';
import { getGallery, saveGalleryImage, deleteGalleryImage } from '../utils/api';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface GalleryImage {
  id: string;
  url: string;
  caption: string;
}

interface GalleryPanelProps {
  accessToken: string;
}

export function GalleryPanel({ accessToken }: GalleryPanelProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ url: '', caption: '' });
  const [loading, setLoading] = useState(false);

  const fetchGallery = async () => {
    try {
      const result = await getGallery();
      if (result.images) {
        setImages(result.images);
      }
    } catch (error) {
      console.log('Error fetching gallery:', error);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveGalleryImage(formData.url, formData.caption, accessToken);
      toast.success('Image added to gallery!');
      fetchGallery();
      setDialogOpen(false);
      setFormData({ url: '', caption: '' });
    } catch (error) {
      console.log('Error saving image:', error);
      toast.error('Failed to add image');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        await deleteGalleryImage(id, accessToken);
        toast.success('Image deleted');
        fetchGallery();
      } catch (error) {
        console.log('Error deleting image:', error);
        toast.error('Failed to delete image');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gallery</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Image
        </Button>
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No images in gallery. Add your first image!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative aspect-square">
                <ImageWithFallback
                  src={image.url}
                  alt={image.caption}
                  className="w-full h-full object-cover"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => handleDelete(image.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {image.caption && (
                <CardContent className="p-3">
                  <p className="text-sm">{image.caption}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Gallery Image</DialogTitle>
            <DialogDescription>
              Add a new image to your gallery by providing the URL and an optional caption.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Image URL *</Label>
              <Input
                id="url"
                type="url"
                required
                placeholder="https://..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                placeholder="Describe the image..."
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              />
            </div>
            {formData.url && (
              <div className="border rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={formData.url}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Adding...' : 'Add Image'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}