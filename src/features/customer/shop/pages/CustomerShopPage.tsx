'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Package,
  Search,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { shopService, type ShopProduct, type ShopOrder } from '@/lib/api/services/shop.service';
import { useTranslations } from '@/i18n/locale-context';

export function CustomerShopPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Order modal state
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, ords] = await Promise.all([
        shopService.getCustomerProducts(),
        shopService.getCustomerOrders(),
      ]);
      setProducts(prods || []);
      setOrders(ords || []);
    } catch {
      toast.error('Failed to load shop items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      search === '' ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handlePlaceOrder = async () => {
    if (!selectedProduct) return;
    if (!deliveryAddress.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }

    setSubmittingOrder(true);
    try {
      await shopService.placeCustomerOrder({
        product_id: selectedProduct.id,
        quantity: orderQuantity,
        delivery_address: deliveryAddress.trim(),
        notes: orderNotes.trim() || undefined,
      });
      toast.success('Your order has been placed successfully!');
      setSelectedProduct(null);
      setOrderQuantity(1);
      setDeliveryAddress('');
      setOrderNotes('');
      // Reload orders and switch to orders tab
      const ords = await shopService.getCustomerOrders();
      setOrders(ords || []);
      setActiveTab('orders');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order';
      toast.error(msg);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await shopService.cancelCustomerOrder(orderId);
      toast.success('Order cancelled');
      const ords = await shopService.getCustomerOrders();
      setOrders(ords || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel order';
      toast.error(msg);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Delivered
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1">
            <Truck className="h-3 w-3" /> Processing
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 gap-1">
            <XCircle className="h-3 w-3" /> Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ShoppingBag className="h-7 w-7 text-primary" />
            Equipment & Device Shop
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Browse genuine routers, ONUs, optical cables and accessories delivered straight to your door.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'products' | 'orders')} className="w-full">
        <TabsList className="grid w-full sm:w-80 grid-cols-2 mb-6">
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Products ({products.length})
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            My Orders ({orders.length})
          </TabsTrigger>
        </TabsList>

        {/* Products View */}
        <TabsContent value="products" className="space-y-6">
          {/* Search & Categories Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search routers, cables, ONUs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="capitalize text-xs h-8"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 rounded-xl bg-muted/40 animate-pulse border" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 border border-dashed rounded-xl">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="font-semibold text-foreground text-base">No products found</h3>
              <p className="text-xs text-muted-foreground mt-1">Try refining your search keyword or category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p) => {
                const inStock = p.stock_status !== 'out_of_stock' && p.stock_quantity > 0;
                return (
                  <Card key={p.id} className="flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg border-border/80">
                    <div className="aspect-video w-full bg-muted/30 relative flex items-center justify-center border-b">
                      {p.image ? (
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="h-12 w-12 text-muted-foreground/40" />
                      )}
                      <span className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wide">
                          {p.category}
                        </Badge>
                      </span>
                      <span className="absolute top-2 right-2">
                        {inStock ? (
                          <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-0 text-[10px]">
                            In Stock
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">
                            Out of Stock
                          </Badge>
                        )}
                      </span>
                    </div>

                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base font-bold line-clamp-1">{p.title}</CardTitle>
                      {p.description && (
                        <CardDescription className="text-xs line-clamp-2 mt-1">
                          {p.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-end">
                      <div className="flex items-baseline gap-2 mt-3">
                        <span className="text-lg font-bold text-foreground font-mono">৳{p.price.toLocaleString()}</span>
                        {p.original_price && p.original_price > p.price && (
                          <span className="text-xs text-muted-foreground line-through font-mono">
                            ৳{p.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <Button
                        className="w-full gap-2 text-xs font-semibold"
                        disabled={!inStock}
                        onClick={() => {
                          setSelectedProduct(p);
                          setOrderQuantity(1);
                        }}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        {inStock ? 'Order Now' : 'Out of Stock'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Customer Orders View */}
        <TabsContent value="orders" className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 border border-dashed rounded-xl">
              <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="font-semibold text-foreground text-base">No orders yet</h3>
              <p className="text-xs text-muted-foreground mt-1">Products you order will appear here with live tracking status.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setActiveTab('products')}
              >
                Browse Shop
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((o) => (
                <Card key={o.id} className="border-border/80">
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-muted-foreground">Order #{o.id}</span>
                        {getStatusBadge(o.status)}
                      </div>
                      <CardTitle className="text-base font-bold mt-1.5">{o.product_title}</CardTitle>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-foreground">৳{o.total_price.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground font-mono">Qty: {o.quantity}</div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-2 text-xs text-muted-foreground space-y-1.5 border-t mt-3">
                    {o.delivery_address && (
                      <p className="flex items-start gap-1">
                        <span className="font-semibold text-foreground">Address:</span> {o.delivery_address}
                      </p>
                    )}
                    {o.notes && (
                      <p className="flex items-start gap-1">
                        <span className="font-semibold text-foreground">Notes:</span> {o.notes}
                      </p>
                    )}
                    {o.admin_notes && (
                      <p className="flex items-start gap-1 text-primary">
                        <span className="font-semibold">Support Note:</span> {o.admin_notes}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground/80 pt-1">
                      Ordered on: {o.created_at || 'Recently'}
                    </p>
                  </CardContent>

                  {o.status.toLowerCase() === 'pending' && (
                    <CardFooter className="p-3 pt-0 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-500/10 h-8"
                        onClick={() => handleCancelOrder(o.id)}
                      >
                        Cancel Order
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Place Order Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Order Equipment
            </DialogTitle>
            <DialogDescription>
              Complete delivery details to request this hardware for your connection.
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4 py-2">
              {/* Product summary */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
                <div>
                  <h4 className="font-semibold text-sm">{selectedProduct.title}</h4>
                  <p className="text-xs text-muted-foreground">Unit Price: ৳{selectedProduct.price.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-primary">
                    ৳{(selectedProduct.price * orderQuantity).toLocaleString()}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono">Total</p>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <Label htmlFor="order-quantity" className="text-xs font-semibold">Quantity</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={orderQuantity <= 1}
                    onClick={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                  >
                    -
                  </Button>
                  <span className="font-mono font-bold w-10 text-center">{orderQuantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={orderQuantity >= Math.min(10, selectedProduct.stock_quantity)}
                    onClick={() => setOrderQuantity((q) => q + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-1.5">
                <Label htmlFor="delivery-address" className="text-xs font-semibold">
                  Delivery Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="delivery-address"
                  placeholder="Enter flat, building, road, area details..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="text-xs h-20 resize-none"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="order-notes" className="text-xs font-semibold">Additional Notes (Optional)</Label>
                <Input
                  id="order-notes"
                  placeholder="e.g. Call before coming, technician installation requested"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSelectedProduct(null)} disabled={submittingOrder}>
              Cancel
            </Button>
            <Button size="sm" onClick={handlePlaceOrder} disabled={submittingOrder} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {submittingOrder ? 'Placing Order...' : 'Confirm Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
