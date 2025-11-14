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
  imageUrl?: string;
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
    imageUrl: '',
    isSpecial: false,
    specialDays: [],
    available: true,
  });

  const fetchMenu = async () => {
    try {
      console.log('🔍 [ADMIN] Fetching menu items from API...');
      const result = await getMenu();
      console.log('📦 [ADMIN] API Response:', result);
      
      if (result.items) {
        console.log('✅ [ADMIN] Menu items received:', result.items.length, 'items');
        console.log('📋 [ADMIN] All items:', result.items);
        console.log('📂 [ADMIN] Categories in items:', [...new Set(result.items.map((item: MenuItem) => item.category))]);
        setMenuItems(result.items);
      } else {
        console.log('⚠️ [ADMIN] No items found in API response');
      }
    } catch (error) {
      console.log('❌ [ADMIN] Error fetching menu:', error);
      toast.error('Failed to load menu items');
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await getBranding();
      if (result.branding?.categories && Array.isArray(result.branding.categories)) {
        setCategories(result.branding.categories);
      } else {
        // If no categories in database, use defaults
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (error) {
      console.log('Error fetching categories:', error);
      setCategories(DEFAULT_CATEGORIES);
    }
  };

  const saveCategoriesToDatabase = async (newCategories: string[]) => {
    try {
      const result = await getBranding();
      const updatedBranding = {
        ...result.branding,
        categories: newCategories,
      };
      
      await saveBranding(updatedBranding, accessToken);
      console.log('✓ Categories saved to database');
      return true;
    } catch (error) {
      console.error('Error saving categories:', error);
      toast.error('Failed to save categories');
      return false;
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchCategories();
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
        imageUrl: '',
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
      console.log('Saving menu item with token:', accessToken ? 'Token present' : 'NO TOKEN!');
      console.log('Menu item data:', formData);
      const result = await saveMenuItem(formData, accessToken);
      console.log('Save menu result:', result);
      
      if (result.error) {
        console.error('Save error from server:', result.error);
        toast.error(`Failed to save menu item: ${result.error}`);
      } else {
        await fetchMenu();
        setDialogOpen(false);
        toast.success(editingItem ? 'Menu item updated successfully!' : 'Menu item added successfully!');
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error(`Error saving menu item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMenuItem(id, accessToken);
        await fetchMenu();
        toast.success('Menu item deleted successfully!');
      } catch (error) {
        console.log('Error deleting menu item:', error);
        toast.error('Failed to delete menu item');
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

  // Get all categories that have items (includes orphaned categories from old items)
  const allCategoriesWithItems = Object.keys(groupedItems);
  console.log('📂 [ADMIN] All categories with items:', allCategoriesWithItems);
  console.log('📂 [ADMIN] Predefined categories:', categories);

  const handleOpenCategoryDialog = () => {
    setEditingCategoryIndex(null);
    setCategoryEditValue('');
    setCategoryDialogOpen(true);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryEditValue.trim() && !categories.includes(categoryEditValue.trim())) {
      const newCategories = [...categories, categoryEditValue.trim()];
      setCategories(newCategories);
      const saved = await saveCategoriesToDatabase(newCategories);
      if (saved) {
        toast.success('Category added successfully!');
        setCategoryEditValue('');
        setCategoryDialogOpen(false);
      }
    } else if (categories.includes(categoryEditValue.trim())) {
      toast.error('Category already exists!');
    }
  };

  const handleEditCategory = (index: number) => {
    setEditingCategoryIndex(index);
    setCategoryEditValue(categories[index]);
    handleOpenCategoryDialog();
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategoryIndex !== null && categoryEditValue.trim()) {
      const newCategories = [...categories];
      newCategories[editingCategoryIndex] = categoryEditValue.trim();
      setCategories(newCategories);
      const saved = await saveCategoriesToDatabase(newCategories);
      if (saved) {
        toast.success('Category updated successfully!');
        setEditingCategoryIndex(null);
        setCategoryEditValue('');
        setCategoryDialogOpen(false);
      }
    }
  };

  const handleDeleteCategory = async (index: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const newCategories = [...categories];
      newCategories.splice(index, 1);
      setCategories(newCategories);
      const saved = await saveCategoriesToDatabase(newCategories);
      if (saved) {
        toast.success('Category deleted successfully!');
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      toast.info('Uploading image...');
      const result = await uploadGalleryFile(file, formData.name || 'Menu item', accessToken);
      
      if (result.url) {
        setFormData({ ...formData, imageUrl: result.url });
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
          {/* Show ALL categories that have items, not just predefined ones */}
          {allCategoriesWithItems.map((category) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4">
                <h3>{category}</h3>
                {/* Badge to show if category is not in predefined list */}
                {!categories.includes(category) && (
                  <Badge variant="outline" className="text-xs">
                    Orphaned - Consider updating category
                  </Badge>
                )}
              </div>
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
              {formData.imageUrl && (
                <div className="mt-2">
                  <img src={formData.imageUrl} alt="Preview" className="max-w-xs rounded-md" />
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