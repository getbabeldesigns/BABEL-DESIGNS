import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminDashboard,
  updateAdminCollection,
  updateAdminOrderStatus,
  updateAdminProduct,
} from "@/integrations/supabase/admin";
import { toast } from "sonner";

const formatDate = (iso: string) => new Date(iso).toLocaleString();

const orderStatuses = ["created", "payment_pending", "paid", "fulfilled", "cancelled"];
const paymentStatuses = ["created", "pending", "paid", "failed", "refunded"];

const adminStorageKey = "babel_admin_token";

const Admin = () => {
  const queryClient = useQueryClient();
  const [tokenInput, setTokenInput] = useState(() => sessionStorage.getItem(adminStorageKey) ?? "");
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem(adminStorageKey) ?? "");

  const [collectionEdit, setCollectionEdit] = useState<Record<string, { tagline: string; description: string; heroImageUrl: string }>>({});
  const [productEdit, setProductEdit] = useState<Record<string, { imageUrl: string; active: boolean }>>({});

  const hasToken = adminToken.trim().length > 0;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard", adminToken],
    queryFn: () => fetchAdminDashboard(adminToken),
    enabled: hasToken,
  });

  const saveToken = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = tokenInput.trim();
    if (!trimmed) {
      toast.error("Enter admin token.");
      return;
    }
    sessionStorage.setItem(adminStorageKey, trimmed);
    setAdminToken(trimmed);
  };

  const clearToken = () => {
    sessionStorage.removeItem(adminStorageKey);
    setAdminToken("");
    setTokenInput("");
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, paymentStatus }: { orderId: string; status: string; paymentStatus: string | null }) =>
      updateAdminOrderStatus(adminToken, orderId, status, paymentStatus),
    onSuccess: () => {
      toast.success("Order status updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard", adminToken] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to update order.";
      toast.error(message);
    },
  });

  const updateCollectionMutation = useMutation({
    mutationFn: (input: { collectionId: string; tagline: string; description: string; heroImageUrl: string }) =>
      updateAdminCollection(adminToken, input),
    onSuccess: () => {
      toast.success("Collection updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard", adminToken] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to update collection.";
      toast.error(message);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (input: { productId: string; active: boolean; imageUrl: string }) => updateAdminProduct(adminToken, input),
    onSuccess: () => {
      toast.success("Product updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard", adminToken] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to update product.";
      toast.error(message);
    },
  });

  const collectionModel = useMemo(() => {
    if (!data) return [];
    return data.collections.map((collection) => ({
      ...collection,
      edit: collectionEdit[collection.id] ?? {
        tagline: collection.tagline,
        description: collection.description,
        heroImageUrl: collection.hero_image_url ?? "",
      },
    }));
  }, [data, collectionEdit]);

  const productModel = useMemo(() => {
    if (!data) return [];
    return data.products.map((product) => ({
      ...product,
      edit: productEdit[product.id] ?? {
        imageUrl: product.image_url ?? "",
        active: product.active,
      },
    }));
  }, [data, productEdit]);

  if (!hasToken) {
    return (
      <div className="min-h-screen pt-32 md:pt-40">
        <section className="section-padding pt-0">
          <div className="container-editorial max-w-lg">
            <h1 className="font-serif text-4xl mb-6">Admin Access</h1>
            <form onSubmit={saveToken} className="space-y-4 border border-border bg-card p-6">
              <label className="block text-xs uppercase tracking-[0.25em] text-muted-foreground">Admin token</label>
              <input
                type="password"
                value={tokenInput}
                onChange={(event) => setTokenInput(event.target.value)}
                className="w-full border border-border bg-background px-3 py-2"
                placeholder="Enter ADMIN_DASHBOARD_TOKEN"
              />
              <button className="w-full border border-foreground/40 py-3 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors">
                Unlock Dashboard
              </button>
            </form>
          </div>
        </section>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 md:pt-40">
        <section className="section-padding pt-0">
          <div className="container-editorial">
            <h1 className="font-serif text-4xl">Loading admin dashboard...</h1>
          </div>
        </section>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen pt-32 md:pt-40">
        <section className="section-padding pt-0">
          <div className="container-editorial">
            <h1 className="font-serif text-4xl mb-4">Admin dashboard unavailable</h1>
            <p className="font-sans text-muted-foreground mb-6">Check token and deployed admin functions.</p>
            <button onClick={clearToken} className="border border-foreground/40 px-4 py-2 text-xs uppercase tracking-[0.2em]">Reset Token</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 md:pt-40">
      <section className="section-padding pt-0">
        <div className="container-editorial">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="font-serif text-4xl md:text-5xl">Admin Dashboard</h1>
            <div className="flex items-center gap-3">
              <Link to="/crm" className="border border-border px-4 py-2 text-xs uppercase tracking-[0.2em]">CRM</Link>
              <button onClick={clearToken} className="border border-border px-4 py-2 text-xs uppercase tracking-[0.2em]">Lock</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="border border-border p-5 bg-card"><p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Orders</p><p className="text-3xl font-serif mt-2">{data.metrics.orders}</p></div>
            <div className="border border-border p-5 bg-card"><p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Paid Orders</p><p className="text-3xl font-serif mt-2">{data.metrics.paidOrders}</p></div>
            <div className="border border-border p-5 bg-card"><p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Consultancy</p><p className="text-3xl font-serif mt-2">{data.metrics.consultancyRequests}</p></div>
            <div className="border border-border p-5 bg-card"><p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Subscribers</p><p className="text-3xl font-serif mt-2">{data.metrics.subscribers}</p></div>
          </div>

          <div className="mb-10">
            <h2 className="font-serif text-2xl mb-4">Recent Orders</h2>
            <div className="overflow-x-auto border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left">Order</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Payment</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((order) => (
                    <tr key={order.id} className="border-t border-border">
                      <td className="p-3 font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="p-3">
                        <select
                          className="border border-border bg-background px-2 py-1"
                          defaultValue={order.status}
                          onChange={(event) => {
                            updateStatusMutation.mutate({ orderId: order.id, status: event.target.value, paymentStatus: order.payment_status });
                          }}
                        >
                          {orderStatuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <select
                          className="border border-border bg-background px-2 py-1"
                          defaultValue={order.payment_status ?? "pending"}
                          onChange={(event) => {
                            updateStatusMutation.mutate({ orderId: order.id, status: order.status, paymentStatus: event.target.value });
                          }}
                        >
                          {paymentStatuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">{order.currency} {order.total_amount}</td>
                      <td className="p-3">{formatDate(order.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="font-serif text-2xl mb-4">Collections Content</h2>
            <div className="space-y-4">
              {collectionModel.map((collection) => (
                <div key={collection.id} className="border border-border bg-card p-4">
                  <p className="mb-3 font-serif text-xl">{collection.name}</p>
                  <input
                    value={collection.edit.tagline}
                    onChange={(event) =>
                      setCollectionEdit((prev) => ({
                        ...prev,
                        [collection.id]: { ...collection.edit, tagline: event.target.value },
                      }))
                    }
                    className="mb-2 w-full border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Tagline"
                  />
                  <textarea
                    value={collection.edit.description}
                    onChange={(event) =>
                      setCollectionEdit((prev) => ({
                        ...prev,
                        [collection.id]: { ...collection.edit, description: event.target.value },
                      }))
                    }
                    className="mb-2 w-full border border-border bg-background px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Description"
                  />
                  <input
                    value={collection.edit.heroImageUrl}
                    onChange={(event) =>
                      setCollectionEdit((prev) => ({
                        ...prev,
                        [collection.id]: { ...collection.edit, heroImageUrl: event.target.value },
                      }))
                    }
                    className="mb-3 w-full border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Hero image URL"
                  />
                  <button
                    onClick={() =>
                      updateCollectionMutation.mutate({
                        collectionId: collection.id,
                        tagline: collection.edit.tagline,
                        description: collection.edit.description,
                        heroImageUrl: collection.edit.heroImageUrl,
                      })
                    }
                    className="border border-foreground/40 px-4 py-2 text-xs uppercase tracking-[0.2em]"
                  >
                    Save Collection
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="font-serif text-2xl mb-4">Products Draft / Publish</h2>
            <div className="space-y-3">
              {productModel.map((product) => (
                <div key={product.id} className="border border-border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-serif text-lg">{product.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{product.slug}</p>
                    </div>
                    <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
                      <input
                        type="checkbox"
                        checked={product.edit.active}
                        onChange={(event) =>
                          setProductEdit((prev) => ({
                            ...prev,
                            [product.id]: { ...product.edit, active: event.target.checked },
                          }))
                        }
                      />
                      Published
                    </label>
                  </div>
                  <input
                    value={product.edit.imageUrl}
                    onChange={(event) =>
                      setProductEdit((prev) => ({
                        ...prev,
                        [product.id]: { ...product.edit, imageUrl: event.target.value },
                      }))
                    }
                    className="mb-3 w-full border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Image URL"
                  />
                  <button
                    onClick={() =>
                      updateProductMutation.mutate({
                        productId: product.id,
                        active: product.edit.active,
                        imageUrl: product.edit.imageUrl,
                      })
                    }
                    className="border border-foreground/40 px-4 py-2 text-xs uppercase tracking-[0.2em]"
                  >
                    Save Product
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="font-serif text-2xl mb-4">Recent Consultancy Requests</h2>
              <div className="space-y-3">
                {data.consultancyRequests.map((item) => (
                  <div key={item.id} className="border border-border p-4 bg-card">
                    <p className="font-serif text-lg">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.email}</p>
                    <p className="text-sm text-muted-foreground">{item.project_type ?? "-"}</p>
                    <p className="text-xs text-muted-foreground mt-2">{formatDate(item.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-serif text-2xl mb-4">Recent Subscribers</h2>
              <div className="space-y-3">
                {data.subscribers.map((item) => (
                  <div key={item.id} className="border border-border p-4 bg-card">
                    <p className="font-sans">{item.email}</p>
                    <p className="text-xs text-muted-foreground mt-2">{formatDate(item.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Admin;
