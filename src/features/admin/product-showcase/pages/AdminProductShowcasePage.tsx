'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { toast } from 'sonner';
import {
  Play,
  Eye,
  Star,
  Plus,
  Video,
  Film,
  CheckCircle2,
  Share2,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { ProductShowcaseItem } from '@/data/platform/contacts.data';

export function AdminProductShowcasePage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'domain', 'productShowcase'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'productShowcase');
      return res as { items: ProductShowcaseItem[] };
    },
  });

  const [items, setItems] = useState<ProductShowcaseItem[] | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<ProductShowcaseItem | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [newVideo, setNewVideo] = useState<{
    title: string;
    subtitle: string;
    category: 'Billing' | 'MikroTik' | 'Customer Portal' | 'Reporting';
    featured: boolean;
  }>({
    title: '',
    subtitle: '',
    category: 'Billing',
    featured: false,
  });

  const list = items ?? data?.items ?? [];

  const handleCreateShowcase = () => {
    if (!newVideo.title.trim()) {
      toast.error('Video title is required');
      return;
    }
    const created: ProductShowcaseItem = {
      id: `show_${Date.now()}`,
      title: newVideo.title.trim(),
      subtitle: newVideo.subtitle || 'Comprehensive product walkthrough for client onboarding',
      description: newVideo.subtitle || 'Full demonstration of ISP operational platform features and workflow automation.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: '/images/brand/logo.svg',
      category: newVideo.category,
      views: 120,
      featured: newVideo.featured,
      createdAt: new Date().toISOString().split('T')[0] ?? '2026-09-10',
    };
    setItems([created, ...list]);
    toast.success(`Showcase video "${created.title}" added to library!`);
    setCreateModalOpen(false);
    setNewVideo({ title: '', subtitle: '', category: 'Billing', featured: false });
  };

  if (isLoading) return <PageSkeleton variant="cards" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load showcase" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const totalViews = list.reduce((sum, item) => sum + item.views, 0);
  const featuredCount = list.filter((i) => i.featured).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Showcase & Demos"
        subtitle="Interactive product video walkthroughs, portal demonstrations, and client onboarding videos"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Engagement' },
          { label: 'Product Showcase' },
        ]}
        actions={
          <Button
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Demo Showcase
          </Button>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Total Walkthrough Videos', value: list.length },
          { label: 'Featured Showcases', value: `${featuredCount} Highlights` },
          { label: 'Total Client Video Views', value: `${totalViews.toLocaleString()} Views` },
          { label: 'Streaming Resolution', value: '1080p FHD (HLS Fast Stream)' },
          { label: 'Categories Covered', value: 'Billing, Hotspot, OLT, Mobile Self-Care' },
        ]}
      />

      {/* Grid of Showcase Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((item) => (
          <Card
            key={item.id}
            className="border-border/60 overflow-hidden group hover:border-primary/60 transition-all shadow-sm hover:shadow-md flex flex-col cursor-pointer bg-card/80"
            onClick={() => setSelectedVideo(item)}
          >
            <div className="relative aspect-video bg-muted/60 flex items-center justify-center overflow-hidden border-b border-border/40">
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent z-10" />
              <div className="h-12 w-12 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center z-20 shadow-lg group-hover:scale-110 transition-transform">
                <Play className="h-5 w-5 ml-0.5 fill-current" />
              </div>
              {item.featured && (
                <Badge className="absolute top-2.5 left-2.5 gap-1 bg-amber-500 hover:bg-amber-500 text-white font-mono text-[10px] z-20 shadow-sm">
                  <Star className="h-3 w-3 fill-current" />
                  Featured
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="absolute bottom-2.5 right-2.5 text-[10px] font-mono z-20 bg-background/80 backdrop-blur-xs gap-1"
              >
                <Clock className="h-3 w-3 text-muted-foreground" />
                3:45
              </Badge>
            </div>
            <CardContent className="space-y-2.5 p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                    {item.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                  {item.subtitle}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40 font-mono">
                <span className="flex items-center gap-1 text-primary">
                  <Eye className="h-3.5 w-3.5" />
                  {item.views.toLocaleString()} views
                </span>
                <span className="text-xs text-muted-foreground group-hover:text-foreground font-sans font-medium flex items-center gap-0.5">
                  Watch Demo →
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Video Player Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" />
              {selectedVideo?.title}
            </DialogTitle>
            <DialogDescription>{selectedVideo?.subtitle}</DialogDescription>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-4 py-2">
              <div className="relative aspect-video rounded-xl bg-slate-950 flex flex-col items-center justify-center text-center p-6 border border-border/80 overflow-hidden shadow-inner">
                <div className="h-16 w-16 rounded-full bg-primary/20 border border-primary/40 text-primary flex items-center justify-center animate-pulse mb-3">
                  <Play className="h-8 w-8 ml-1 fill-current" />
                </div>
                <h4 className="font-semibold text-sm text-foreground">Interactive Video Demonstration</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Streaming {selectedVideo.title} (1080p FHD HLS Video Stream).
                </p>
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>0:42 / 3:45</span>
                  <span className="text-emerald-500 font-semibold">HD 1080p · 60fps</span>
                </div>
              </div>

              <div className="p-3.5 bg-muted/20 border border-border/50 rounded-xl space-y-1.5 text-xs">
                <span className="font-semibold block text-foreground">Demonstration Highlights:</span>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Automated subscriber invoicing and bKash merchant gateway integration</li>
                  <li>Real-time MikroTik bandwidth queue rate-limiting and session drops</li>
                  <li>OLT PON port optical signal monitoring and ONU reboot controls</li>
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedVideo(null)}>
              Close
            </Button>
            <Button
              className="gap-1.5 bg-primary text-primary-foreground"
              onClick={() => {
                toast.success('Demonstration link copied to share with client');
                setSelectedVideo(null);
              }}
            >
              <Share2 className="h-4 w-4" />
              Share Demo Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Showcase Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Add Product Showcase Video
            </DialogTitle>
            <DialogDescription>
              Register a new video demonstration into the client onboarding library.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Video Title</Label>
              <Input
                value={newVideo.title}
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                placeholder="e.g. MikroTik Sync & Queue Management"
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Category</Label>
              <Select
                value={newVideo.category}
                onValueChange={(v) => { if (v) setNewVideo({ ...newVideo, category: v as 'Billing' | 'MikroTik' | 'Customer Portal' | 'Reporting' }); }}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Billing">Billing & Accounting</SelectItem>
                  <SelectItem value="MikroTik">MikroTik RouterOS</SelectItem>
                  <SelectItem value="Customer Portal">Customer Portal</SelectItem>
                  <SelectItem value="Reporting">Reporting & BI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Video Description / Subtitle</Label>
              <Textarea
                value={newVideo.subtitle}
                onChange={(e) => setNewVideo({ ...newVideo, subtitle: e.target.value })}
                placeholder="Brief summary of what this video demonstrates..."
                className="h-20 text-xs font-mono resize-y"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateShowcase} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Add Showcase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
