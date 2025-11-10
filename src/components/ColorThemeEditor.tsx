import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { getBranding, saveBranding } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface ColorThemeEditorProps {
  accessToken: string;
}

export function ColorThemeEditor({ accessToken }: ColorThemeEditorProps) {
  const [colors, setColors] = useState({
    primaryColor: '#E91E63',
    secondaryColor: '#1A237E',
    accentColor: '#FF6B35',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const result = await getBranding();
        if (result.branding) {
          setColors({
            primaryColor: result.branding.primaryColor || '#E91E63',
            secondaryColor: result.branding.secondaryColor || '#1A237E',
            accentColor: result.branding.accentColor || '#FF6B35',
          });
          
          // Apply colors to CSS variables
          applyColors(
            result.branding.primaryColor || '#E91E63',
            result.branding.secondaryColor || '#1A237E',
            result.branding.accentColor || '#FF6B35'
          );
        }
      } catch (error) {
        console.log('Error fetching branding:', error);
      }
    };
    fetchBranding();
  }, []);

  const applyColors = (primary: string, secondary: string, accent: string) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', primary);
    root.style.setProperty('--secondary', secondary);
    root.style.setProperty('--ring', primary);
    root.style.setProperty('--sidebar-primary', primary);
    root.style.setProperty('--sidebar-ring', primary);
    root.style.setProperty('--border', `${primary}33`); // 20% opacity
    root.style.setProperty('--accent', `${primary}22`); // 13% opacity
    root.style.setProperty('--accent-foreground', primary);
    root.style.setProperty('--chart-1', primary);
    root.style.setProperty('--chart-2', accent);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const brandingResult = await getBranding();
      const existingBranding = brandingResult.branding || {};
      
      await saveBranding(
        {
          ...existingBranding,
          ...colors,
        },
        accessToken
      );
      
      applyColors(colors.primaryColor, colors.secondaryColor, colors.accentColor);
      toast.success('Color theme updated successfully!');
    } catch (error) {
      console.log('Error saving colors:', error);
      toast.error('Failed to save color theme');
    } finally {
      setSaving(false);
    }
  };

  const presets = [
    { name: 'Mexican Folk Art', primary: '#E91E63', secondary: '#1A237E', accent: '#FF6B35' },
    { name: 'Traditional Red', primary: '#DC2626', secondary: '#7F1D1D', accent: '#FFA500' },
    { name: 'Green & Gold', primary: '#059669', secondary: '#065F46', accent: '#FBBF24' },
    { name: 'Ocean Blue', primary: '#0EA5E9', secondary: '#0C4A6E', accent: '#F472B6' },
    { name: 'Purple Passion', primary: '#9333EA', secondary: '#581C87', accent: '#FB923C' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Color Theme</CardTitle>
        <CardDescription>
          Customize your site's color scheme. Changes apply immediately across the entire application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={colors.primaryColor}
                onChange={(e) => setColors({ ...colors, primaryColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={colors.primaryColor}
                onChange={(e) => setColors({ ...colors, primaryColor: e.target.value })}
                placeholder="#E91E63"
              />
            </div>
            <p className="text-xs text-muted-foreground">Main brand color, buttons, links</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                id="secondaryColor"
                type="color"
                value={colors.secondaryColor}
                onChange={(e) => setColors({ ...colors, secondaryColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={colors.secondaryColor}
                onChange={(e) => setColors({ ...colors, secondaryColor: e.target.value })}
                placeholder="#1A237E"
              />
            </div>
            <p className="text-xs text-muted-foreground">Headings, emphasis text</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accentColor">Accent Color</Label>
            <div className="flex gap-2">
              <Input
                id="accentColor"
                type="color"
                value={colors.accentColor}
                onChange={(e) => setColors({ ...colors, accentColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={colors.accentColor}
                onChange={(e) => setColors({ ...colors, accentColor: e.target.value })}
                placeholder="#FF6B35"
              />
            </div>
            <p className="text-xs text-muted-foreground">Highlights, special elements</p>
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-3">
          <Label>Quick Presets</Label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => setColors({
                  primaryColor: preset.primary,
                  secondaryColor: preset.secondary,
                  accentColor: preset.accent,
                })}
                className="h-auto flex-col py-2"
              >
                <div className="flex gap-1 mb-1">
                  <div 
                    className="w-4 h-4 rounded-full border" 
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full border" 
                    style={{ backgroundColor: preset.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full border" 
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <span className="text-xs">{preset.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <Label>Preview</Label>
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex gap-2">
              <Button size="sm" style={{ backgroundColor: colors.primaryColor, color: 'white' }}>
                Primary Button
              </Button>
              <Button size="sm" variant="outline" style={{ borderColor: colors.primaryColor, color: colors.primaryColor }}>
                Outline Button
              </Button>
            </div>
            <div className="p-3 rounded border-l-4" style={{ borderLeftColor: colors.primaryColor, backgroundColor: `${colors.primaryColor}11` }}>
              <p style={{ color: colors.secondaryColor }}>Sample card with your selected colors</p>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Apply Color Theme'}
        </Button>
      </CardContent>
    </Card>
  );
}
