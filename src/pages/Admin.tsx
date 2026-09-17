import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminDashboard,
  updateAdminCollection,
  updateAdminOrderStatus,
  updateAdminProduct,
} from "@/integrations/supabase/admin";
import { getCurrentUser, onAuthChange, signOutUser, startOAuthSignIn } from "@/integrations/supabase/auth";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formatDate = (iso: string) => new Date(iso).toLocaleString();

const orderStatuses = ["created", "payment_pending", "paid", "fulfilled", "cancelled"];
const paymentStatuses = ["created", "pending", "paid", "failed", "refunded"];

const Admin = () => {
  const queryClient = useQueryClient();
  // Real admin gating: sign in with the same Google OAuth used on /auth, then
  // the edge functions check whether this signed-in user's id is in the
  // admin_users table (see supabase/schema.sql). There's no shared secret
  // anymore, so being signed in isn't enough on its own — see the
  // isForbidden handling below for the "signed in but not an admin" case.
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [collectionEdit, setCollectionEdit] = useState<Record<string, { tagline: string; description: string; heroImageUrl: string }>>({});
  const [productEdit, setProductEdit] = useState<Record<string, { imageUrl: string; active: boolean }>>({});

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;
    getCurrentUser()
      .then((currentUser) => {
        if (mounted) setUser(currentUser);
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setAuthLoading(false);
      });

    const subscription = onAuthChange((nextUser) => {
      if (mounted) setUser(nextUser);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard", user?.id],
    queryFn: () => fetchAdminDashboard(),
    enabled: Boolean(user),
    retry: false,
  });

  const handleSignIn = () => {
    setIsSigningIn(true);
    startOAuthSignIn("google")
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to start sign in";
        toast.error(message);
      })
      .finally(() => setIsSigningIn(false));
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      toast.success("Signed out.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to sign out";
      toast.error(message);
    }
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, paymentStatus }: { orderId: string; status: string; paymentStatus: string | null }) =>
      updateAdminOrderStatus(orderId, status, paymentStatus),
    onSuccess: () => {
      toast.success("Order status updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard", user?.id] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to update order.";
      toast.error(message);
    },
  });

  const updateCollectionMutation = useMutation({
    mutationFn: (input: { collectionId: string; tagline: string; description: string; heroImageUrl: string }) =>
      updateAdminCollection(input),
    onSuccess: () => {
      toast.success("Collection updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard", user?.id] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to update collection.";
      toast.error(message);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (input: { productId: string; active: boolean; imageUrl: string }) => updateAdminProduct(input),
    onSuccess: () => {
      toast.success("Product updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard", user?.id] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to update product.";
      toast.error(message);
    },
  });

  const collectionModel = useMemo(() => {
    if (!data) return [];
    return (data.collections ?? []).map((collection) => ({
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
    return (data.products ?? []).map((product) => ({
      ...product,
      edit: productEdit[product.id] ?? {
        imageUrl: product.image_url ?? "",
        active: product.active,
      },
    }));
  }, [data, productEdit]);

  if (authLoading) {
    return (
      <div className="min-h-screen pt-32 md:pt-40">
        <section className="section-padding pt-0">
          <div className="container-editorial">
            <h1 className="font-serif text-4xl">Checking your session...</h1>
          </div>
        </section>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 md:pt-40">
        <section className="section-padding pt-0">
          <div className="container-editorial max-w-lg">
            <h1 className="font-serif text-4xl mb-6">Admin Access</h1>
            <div className="space-y-4 border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">
                Sign in with the Google account that's been granted admin access to manage orders,
                collections, products and requests.
              </p>
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="w-full border border-foreground/40 py-3 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors disabled:opacity-60"
              >
                {isSigningIn ? "Connecting..." : "Sign in with Google"}
              </button>
            </div>
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
          <div className="container-editorial max-w-lg">
            <h1 className="font-serif text-4xl mb-4">Not authorized</h1>
            <p className="font-sans text-muted-foreground mb-6">
              You're signed in as {user.email}, but this account doesn't have admin access. Ask an
              existing admin to add your account, or sign in with a different one.
            </p>
            <button onClick={handleSignOut} className="border border-foreground/40 px-4 py-2 text-xs uppercase tracking-[0.2em]">Sign out</button>
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
              <span className="text-xs text-muted-foreground">{user.email}</span>
              <button onClick={handleSignOut} className="border border-border px-4 py-2 text-xs uppercase tracking-[0.2em]">Sign out</button>
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
                  {(data.orders ?? []).map((order) => (
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
                {(data.consultancyRequests ?? []).map((item) => (
                  <div key={item.id} className="border border-border p-4 bg-card">
                    <p className="font-serif text-lg">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.email}</p>
                    <p className="text-sm text-muted-foreground">{item.project_type ?? "-"}</p>
                    {(item.preferred_date || item.preferred_slot) && (
                      <p className="text-sm text-muted-foreground">
                        Requested slot: {item.preferred_date ?? "-"} {item.preferred_slot ?? ""}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">{formatDate(item.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-serif text-2xl mb-4">Recent Subscribers</h2>
              <div className="space-y-3">
                {(data.subscribers ?? []).map((item) => (
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
