import { useState, useEffect } from 'react';
import { getMenu, saveMenuItem, deleteMenuItem, getBranding, saveBranding, uploadGalleryFile } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Plus, Trash2, Edit, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface MenuItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isSpecial: boolean;
  specialDays: string[];
  available: boolean;
}

interface MenuManagementProps {
  accessToken: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_CATEGORIES = ['Appetizers', 'Tacos', 'Burritos', 'Enchiladas', 'Quesadillas', 'Sides', 'Desserts', 'Drinks'];

export function MenuManagement({ accessToken }: MenuManagementProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [categoryEditValue, setCategoryEditValue] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<MenuItem>({
    name: '',
    description: '',
    price: 0,
    category: 'Tacos',
    image: '',
    isSpecial: false,
    specialDays: [],
    available: true,
  });

  const fetchMenu = async () => {
    try {
      const result = await getMenu();
      if (result.items) {
        setMenuItems(result.items);
      }
    } catch (error) {
      console.log('Error fetching menu:', error);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'Tacos',
        image: '',
        isSpecial: false,
        specialDays: [],
        available: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveMenuItem(formData, accessToken);
      fetchMenu();
      setDialogOpen(false);
    } catch (error) {
      console.log('Error saving menu item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMenuItem(id, accessToken);
        fetchMenu();
      } catch (error) {
        console.log('Error deleting menu item:', error);
      }
    }
  };

  const toggleDay = (day: string) => {
    const days = formData.specialDays.includes(day)
      ? formData.specialDays.filter(d => d !== day)
      : [...formData.specialDays, day];
    setFormData({ ...formData, specialDays: days });
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const handleOpenCategoryDialog = () => {
    setCategoryDialogOpen(true);
  };

  const handleAddCategory = () => {
    if (categoryEditValue.trim() && !categories.includes(categoryEditValue.trim())) {
      setCategories([...categories, categoryEditValue.trim()]);
      setCategoryEditValue('');
    }
  };

  const handleEditCategory = (index: number) => {
    setEditingCategoryIndex(index);
    setCategoryEditValue(categories[index]);
    handleOpenCategoryDialog();
  };

  const handleSaveCategory = () => {
    if (editingCategoryIndex !== null && categoryEditValue.trim()) {
      const newCategories = [...categories];
      newCategories[editingCategoryIndex] = categoryEditValue.trim();
      setCategories(newCategories);
      setEditingCategoryIndex(null);
      setCategoryEditValue('');
    }
  };

  const handleDeleteCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    setCategories(newCategories);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      toast.info('Uploading image...');
      const result = await uploadGalleryFile(file, formData.name || 'Menu item', accessToken);
      
      if (result.url) {
        setFormData({ ...formData, image: result.url });
        toast.success('Image uploaded successfully!');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Menu Management</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {Object.keys(groupedItems).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No menu items yet. Add your first item!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {categories.filter(cat => groupedItems[cat]).map((category) => (
            <div key={category}>
              <h3 className="mb-4">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedItems[category].map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4>{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDialog(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.id!)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-green-600">${item.price.toFixed(2)}</span>
                        <div className="flex gap-1">
                          {item.isSpecial && (
                            <Badge variant="secondary">Special</Badge>
                          )}
                          {!item.available && (
                            <Badge variant="outline">Unavailable</Badge>
                          )}
                        </div>
                      </div>
                      {item.specialDays.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {item.specialDays.join(', ')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Make changes to your menu item here.' : 'Add a new menu item here.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={handleImageUpload}
              />
              {formData.image && (
                <div className="mt-2">
                  <img src={formData.image} alt="Preview" className="max-w-xs rounded-md" />
                  <p className="text-xs text-muted-foreground mt-1">Current image</p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="available"
                checked={formData.available}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, available: checked as boolean })
                }
              />
              <Label htmlFor="available">Available for order</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isSpecial"
                checked={formData.isSpecial}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, isSpecial: checked as boolean })
                }
              />
              <Label htmlFor="isSpecial">Special item</Label>
            </div>

            {formData.isSpecial && (
              <div className="space-y-2">
                <Label>Available Days</Label>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={formData.specialDays.includes(day)}
                        onCheckedChange={() => toggleDay(day)}
                      />
                      <Label htmlFor={day} className="cursor-pointer">{day}</Label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Leave empty to show every day
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingItem ? 'Update Item' : 'Add Item'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategoryIndex !== null ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategoryIndex !== null ? 'Make changes to your category here.' : 'Add a new category here.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingCategoryIndex !== null ? handleSaveCategory : handleAddCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryEditValue">Category Name *</Label>
              <Input
                id="categoryEditValue"
                required
                value={categoryEditValue}
                onChange={(e) => setCategoryEditValue(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingCategoryIndex !== null ? 'Update Category' : 'Add Category'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <h2>Categories Management</h2>
        <Button onClick={() => handleOpenCategoryDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="space-y-4">
        {categories.map((category, index) => (
          <div key={index} className="flex justify-between items-center">
            <span>{category}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditCategory(index)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteCategory(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}