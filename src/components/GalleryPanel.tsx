import { useState, useEffect } from 'react';
import { getGallery, saveGalleryImage, deleteGalleryImage, uploadGalleryFile } from '../utils/api';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Plus, Trash2, Video, Image, Upload } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  type?: 'image' | 'video';
}

interface GalleryPanelProps {
  accessToken: string;
}

export function GalleryPanel({ accessToken }: GalleryPanelProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ url: '', caption: '', type: 'image' as 'image' | 'video' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('file');
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

  const handleURLSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveGalleryImage(formData.url, formData.caption, accessToken, formData.type);
      toast.success(`${formData.type === 'video' ? 'Video' : 'Image'} added to gallery!`);
      fetchGallery();
      setDialogOpen(false);
      setFormData({ url: '', caption: '', type: 'image' });
    } catch (error) {
      console.log('Error saving item:', error);
      toast.error(`Failed to add ${formData.type}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }
    
    setLoading(true);
    try {
      const result = await uploadGalleryFile(uploadFile, formData.caption, accessToken);
      toast.success(`${uploadFile.type.includes('video') ? 'Video' : 'Image'} uploaded successfully!`);
      fetchGallery();
      setDialogOpen(false);
      setFormData({ url: '', caption: '', type: 'image' });
      setUploadFile(null);
    } catch (error) {
      console.log('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteGalleryImage(id, accessToken);
        toast.success('Item deleted');
        fetchGallery();
      } catch (error) {
        console.log('Error deleting item:', error);
        toast.error('Failed to delete item');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast.error('Please upload only images or videos');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10485760) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setUploadFile(file);
      setFormData({ ...formData, type: isVideo ? 'video' : 'image' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gallery</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Media
        </Button>
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No media in gallery. Add your first image or video!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-square bg-gray-100">
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <ImageWithFallback
                    src={item.url}
                    alt={item.caption}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 left-2">
                  {item.type === 'video' ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      Video
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Image className="w-3 h-3" />
                      Image
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {item.caption && (
                <CardContent className="p-3">
                  <p className="text-sm">{item.caption}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Gallery Media</DialogTitle>
            <DialogDescription>
              Upload your own photos/videos or provide a URL.\n            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as 'url' | 'file')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="url">
                URL
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="file">
              <form onSubmit={handleFileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Select Image or Video (Max 10MB) *</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    required
                  />
                  {uploadFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)}MB)
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="caption-file">Caption</Label>
                  <Input
                    id="caption-file"
                    placeholder="Describe your photo or video..."
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  />
                </div>
                
                {uploadFile && (
                  <div className="border rounded-lg overflow-hidden">
                    {uploadFile.type.startsWith('video/') ? (
                      <video
                        src={URL.createObjectURL(uploadFile)}
                        className="w-full h-48 object-cover"
                        controls
                        playsInline
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(uploadFile)}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                    )}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading || !uploadFile} className="flex-1">
                    {loading ? 'Uploading...' : 'Upload'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setDialogOpen(false);
                    setUploadFile(null);
                    setFormData({ url: '', caption: '', type: 'image' });
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="url">
              <form onSubmit={handleURLSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Media Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'image' | 'video') => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">
                        <div className="flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          Image
                        </div>
                      </SelectItem>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          Video (10 sec max)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url">{formData.type === 'video' ? 'Video URL *' : 'Image URL *'}</Label>
                  <Input
                    id="url"
                    type="url"
                    required
                    placeholder={formData.type === 'video' ? 'https://.../video.mp4' : 'https://.../image.jpg'}
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                  {formData.type === 'video' && (
                    <p className="text-xs text-muted-foreground">
                      Please ensure your video is 10 seconds or less for the best experience.
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="caption">Caption</Label>
                  <Input
                    id="caption"
                    placeholder="Describe the media..."
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  />
                </div>
                
                {formData.url && (
                  <div className="border rounded-lg overflow-hidden">
                    {formData.type === 'video' ? (
                      <video
                        src={formData.url}
                        className="w-full h-48 object-cover"
                        controls
                        playsInline
                      />
                    ) : (
                      <ImageWithFallback
                        src={formData.url}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                    )}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Adding...' : `Add ${formData.type === 'video' ? 'Video' : 'Image'}`}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setDialogOpen(false);
                    setFormData({ url: '', caption: '', type: 'image' });
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}