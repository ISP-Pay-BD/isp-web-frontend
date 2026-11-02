'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Package,
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatBdtWithSymbol } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  shopService,
  type ShopProduct,
  type ShopOrder,
  type SaveProductPayload,
} from '@/lib/api/services/shop.service';

export function ShopManagementPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchProduct, setSearchProduct] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');

  // Product modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null);
  const [productForm, setProductForm] = useState<SaveProductPayload>({
    title: '',
    category: 'router',
    price: 0,
    original_price: undefined,
    stock_status: 'in_stock',
    stock_quantity: 10,
    image: '',
    description: '',
    status: 'active',
  });
  const [savingProduct, setSavingProduct] = useState(false);

  // Order status update modal
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<string>('pending');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [updatingOrder, setUpdatingOrder] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, ords] = await Promise.all([
        shopService.getAdminProducts(),
        shopService.getAdminOrders(),
      ]);
      setProducts(prods || []);
      setOrders(ords || []);
    } catch {
      toast.error('Failed to load shop management data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      category: 'router',
      price: 0,
      original_price: undefined,
      stock_status: 'in_stock',
      stock_quantity: 10,
      image: '',
      description: '',
      status: 'active',
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: ShopProduct) => {
    setEditingProduct(p);
    setProductForm({
      id: p.id,
      title: p.title,
      category: p.category,
      price: p.price,
      original_price: p.original_price ?? undefined,
      stock_status: p.stock_status,
      stock_quantity: p.stock_quantity,
      image: p.image ?? '',
      description: p.description ?? '',
      status: p.status,
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.title.trim()) {
      toast.error('Product title is required');
      return;
    }
    if (productForm.price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setSavingProduct(true);
    try {
      if (editingProduct) {
        await shopService.updateProduct(editingProduct.id, productForm);
        toast.success('Product updated successfully');
      } else {
        await shopService.createProduct(productForm);
        toast.success('Product created successfully');
      }
      setProductModalOpen(false);
      const prods = await shopService.getAdminProducts();
      setProducts(prods || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      toast.error(msg);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await shopService.deleteProduct(id);
      toast.success('Product removed');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete product';
      toast.error(msg);
    }
  };

  const handleOpenUpdateOrder = (o: ShopOrder) => {
    setSelectedOrder(o);
    setNewOrderStatus(o.status);
    setAdminNotes(o.admin_notes ?? '');
  };

  const handleSaveOrderStatus = async () => {
    if (!selectedOrder) return;
    setUpdatingOrder(true);
    try {
      await shopService.updateOrderStatus(selectedOrder.id, {
        status: newOrderStatus,
        admin_notes: adminNotes.trim() || undefined,
      });
      toast.success(`Order #${selectedOrder.id} status updated to ${newOrderStatus}`);
      setSelectedOrder(null);
      const ords = await shopService.getAdminOrders();
      setOrders(ords || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update order';
      toast.error(msg);
    } finally {
      setUpdatingOrder(false);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return (
          <Badge tone="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> Delivered
          </Badge>
        );
      case 'processing':
        return (
          <Badge tone="info" className="gap-1">
            <Truck className="h-3 w-3" /> Processing
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge tone="danger" className="gap-1">
            <XCircle className="h-3 w-3" /> Cancelled
          </Badge>
        );
      default:
        return (
          <Badge tone="warning" className="gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status.toLowerCase() === orderFilter.toLowerCase();
  });

  const filteredProducts = products.filter((p) => {
    if (!searchProduct) return true;
    return (
      p.title.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.category.toLowerCase().includes(searchProduct.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ShoppingBag className="h-7 w-7 text-primary" />
            Equipment Shop Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your hardware catalogue, track customer orders, and dispatch installations.
          </p>
        </div>

        {activeTab === 'products' && (
          <Button onClick={handleOpenAddProduct} className="gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'products' | 'orders')} className="w-full">
        <TabsList className="grid w-full sm:w-80 grid-cols-2 mb-6">
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Products ({products.length})
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Orders ({orders.length})
          </TabsTrigger>
        </TabsList>

        {/* Products Management */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-xs">
                      No products found. Click &quot;Add Product&quot; to create your first item.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded border bg-muted/30 flex items-center justify-center shrink-0 overflow-hidden">
                            {p.image ? (
                              <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground/50" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{p.title}</div>
                            {p.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1">{p.description}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {p.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono font-bold text-sm">{formatBdtWithSymbol(p.price)}</TableCell>
                      <TableCell>
                        {p.stock_status === 'in_stock' ? (
                          <Badge tone="success">
                            In Stock
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Out of Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{p.stock_quantity}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'active' ? 'secondary' : 'outline'}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleOpenEditProduct(p)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                            onClick={() => handleDeleteProduct(p.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Orders Management */}
        <TabsContent value="orders" className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1.5">
              {['all', 'pending', 'processing', 'delivered', 'cancelled'].map((status) => (
                <Button
                  key={status}
                  variant={orderFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOrderFilter(status)}
                  className="capitalize text-xs h-8"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Total (BDT)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery Address</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-xs">
                      No customer orders matching the filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs font-bold">#{o.id}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-xs">{o.customer_name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{o.customer_mobile}</div>
                      </TableCell>
                      <TableCell className="font-medium text-xs">{o.product_title}</TableCell>
                      <TableCell className="font-mono text-xs">{o.quantity}</TableCell>
                      <TableCell className="font-mono font-bold text-xs text-primary">{formatBdtWithSymbol(o.total_price)}</TableCell>
                      <TableCell>{getOrderStatusBadge(o.status)}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="text-xs text-muted-foreground truncate" title={o.delivery_address ?? ''}>
                          {o.delivery_address || '—'}
                        </div>
                        {o.notes && (
                          <div className="text-xs text-muted-foreground/80 italic truncate" title={o.notes}>
                            Note: {o.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 gap-1"
                          onClick={() => handleOpenUpdateOrder(o)}
                        >
                          Update Status
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Create / Edit Modal */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              Configure hardware details for your customer portal equipment catalogue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Title *</Label>
              <Input
                placeholder="e.g. TP-Link Archer C6 Gigabit Router"
                value={productForm.title}
                onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category</Label>
                <Select
                  value={productForm.category}
                  onValueChange={(val) => setProductForm({ ...productForm, category: val ?? 'router' })}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="router">Router</SelectItem>
                    <SelectItem value="onu">ONU / EPON</SelectItem>
                    <SelectItem value="cables">Optical Cables</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Price (BDT) *</Label>
                <Input
                  type="number"
                  placeholder="2800"
                  value={productForm.price || ''}
                  onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Stock Status</Label>
                <Select
                  value={productForm.stock_status}
                  onValueChange={(val) => setProductForm({ ...productForm, stock_status: val ?? 'in_stock' })}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Stock Quantity</Label>
                <Input
                  type="number"
                  value={productForm.stock_quantity ?? 0}
                  onChange={(e) =>
                    setProductForm({ ...productForm, stock_quantity: parseInt(e.target.value) || 0 })
                  }
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Image URL (Optional)</Label>
              <Input
                placeholder="https://..."
                value={productForm.image ?? ''}
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                placeholder="Product specifications, warranty details..."
                value={productForm.description ?? ''}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="text-xs h-20 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setProductModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveProduct} disabled={savingProduct}>
              {savingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Status Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id} — {selectedOrder?.product_title}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Status</Label>
                <Select value={newOrderStatus} onValueChange={(val) => val && setNewOrderStatus(val)}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing (Technician Dispatched)</SelectItem>
                    <SelectItem value="delivered">Delivered / Installed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Admin / Delivery Note</Label>
                <Textarea
                  placeholder="e.g. Dispatched with technician Rahim, tracking ref #..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="text-xs h-20 resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveOrderStatus} disabled={updatingOrder}>
              {updatingOrder ? 'Saving...' : 'Save Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
