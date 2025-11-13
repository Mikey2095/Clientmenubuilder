import { useState, useEffect } from 'react';
import { getBranding, saveBranding } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ColorThemeEditor } from './ColorThemeEditor';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

interface BrandingPanelProps {
  accessToken: string;
}

export function BrandingPanel({ accessToken }: BrandingPanelProps) {
  const [formData, setFormData] = useState({
    businessName: 'Menú Mexicano',
    tagline: 'Authentic Mexican Cuisine',
    logo: '',
    primaryColor: '#E91E63',
    phoneNumber: '',
    email: '',
    address: '',
    zelleInfo: '',
    venmoInfo: '',
    facebookUrl: '',
    instagramUrl: '',
    googleReviewUrl: '',
    yelpUrl: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const result = await getBranding();
        if (result.branding && Object.keys(result.branding).length > 0) {
          setFormData({ ...formData, ...result.branding });
        }
      } catch (error) {
        console.log('Error fetching branding:', error);
      }
    };
    fetchBranding();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      console.log('Saving branding with token:', accessToken ? 'Token present' : 'NO TOKEN!');
      console.log('Branding data:', formData);
      const result = await saveBranding(formData, accessToken);
      console.log('Save result:', result);
      
      if (result.error) {
        console.error('Save error from server:', result.error);
        toast.error(`Failed to save branding: ${result.error}`);
      } else {
        toast.success('Branding saved successfully!');
      }
    } catch (error) {
      console.error('Error saving branding:', error);
      toast.error(`Failed to save branding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Color Theme Editor */}
      <ColorThemeEditor accessToken={accessToken} />
      
      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Update your business details and contact information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Mi Cocina Mexicana"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Authentic Mexican Cuisine"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://..."
              />
              {formData.logo && (
                <div className="mt-2">
                  <img src={formData.logo} alt="Logo preview" className="h-16 object-contain" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@restaurant.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main St, City, State 12345"
                rows={3}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Payment Information</h4>
              
              <div className="space-y-2">
                <Label htmlFor="zelleInfo">Zelle Payment Info</Label>
                <Input
                  id="zelleInfo"
                  value={formData.zelleInfo}
                  onChange={(e) => setFormData({ ...formData, zelleInfo: e.target.value })}
                  placeholder="phone number or email for Zelle"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venmoInfo">Venmo Username</Label>
                <Input
                  id="venmoInfo"
                  value={formData.venmoInfo}
                  onChange={(e) => setFormData({ ...formData, venmoInfo: e.target.value })}
                  placeholder="@username"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Social Media & Reviews</h4>
              
              <div className="space-y-2">
                <Label htmlFor="facebookUrl">Facebook Page URL</Label>
                <Input
                  id="facebookUrl"
                  type="url"
                  value={formData.facebookUrl}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagramUrl">Instagram URL</Label>
                <Input
                  id="instagramUrl"
                  type="url"
                  value={formData.instagramUrl}
                  onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/youraccount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleReviewUrl">Google Reviews URL</Label>
                <Input
                  id="googleReviewUrl"
                  type="url"
                  value={formData.googleReviewUrl}
                  onChange={(e) => setFormData({ ...formData, googleReviewUrl: e.target.value })}
                  placeholder="https://g.page/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yelpUrl">Yelp URL</Label>
                <Input
                  id="yelpUrl"
                  type="url"
                  value={formData.yelpUrl}
                  onChange={(e) => setFormData({ ...formData, yelpUrl: e.target.value })}
                  placeholder="https://yelp.com/biz/..."
                />
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Branding'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
