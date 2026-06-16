"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Home,
  Loader2,
  ImageIcon,
  MapPin,
  AlertCircle,
  Building2,
  Truck,
  ShieldCheck,
  Clock,
  Star,
  Phone,
  Mail,
  CheckCircle,
  Plus,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { PromoModal } from "@/components/promo-modal";
import { useCart } from "@/lib/cart-context";
import { Ticket } from "lucide-react";
import { getCart, getAddresses, createPayment, validatePromo, Cart, Address } from "@/lib/api";

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess: (result: unknown) => void;
        onPending: (result: unknown) => void;
        onError: (result: unknown) => void;
        onClose: () => void;
      }) => void;
    };
  }
}

const LABEL_ICONS: Record<string, React.ElementType> = {
  Rumah: Home,
  Kantor: Briefcase,
  Apartemen: Building2,
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [notes, setNotes] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ discount: number; code: string; description?: string } | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [showMinDeliveryPopup, setShowMinDeliveryPopup] = useState(false);
  const { refreshCount } = useCart();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/masuk");
      return;
    }

    setLoading(true);
    const user = JSON.parse(storedUser);
    const [cartRes, addressRes] = await Promise.all([
      getCart(user.id),
      getAddresses(user.id),
    ]);

    if (cartRes.data && cartRes.data.items.length > 0) {
      setCart(cartRes.data);
    } else {
      router.push("/keranjang");
      return;
    }

    if (addressRes.data) {
      setAddresses(addressRes.data);
      const defaultAddr = addressRes.data.find((a) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (addressRes.data.length > 0) {
        setSelectedAddressId(addressRes.data[0].id);
      }
    }

    setLoading(false);
  }

  async function handleApplyPromo(codeOverride?: string | React.MouseEvent) {
    const codeToApply = (typeof codeOverride === "string" ? codeOverride : promoCode) || "";
    if (typeof codeOverride === "string") setPromoCode(codeOverride.toUpperCase());
    
    if (!codeToApply.trim()) {
      toast.error("Masukkan kode promo");
      return;
    }
    if (!cart) return;

    setApplyingPromo(true);
    const storedUser = localStorage.getItem("user");
    const userId = storedUser ? JSON.parse(storedUser).id : undefined;
    const result = await validatePromo(codeToApply.trim(), cart.total, userId);
    if (result.data) {
      setPromoApplied({
        discount: result.data.discount,
        code: result.data.promo.code || promoCode,
        description: result.data.promo.description || undefined,
      });
      toast.success(`Promo ${result.data.promo.code} berhasil diterapkan!`);
    } else {
      toast.error(result.error);
      setPromoApplied(null);
    }
    setApplyingPromo(false);
  }

  function handleRemovePromo() {
    setPromoApplied(null);
    setPromoCode("");
  }

  const finalTotal = cart ? cart.total - (promoApplied?.discount || 0) : 0;

  const MIN_DELIVERY_TOTAL = 20000;

  async function handleCheckout() {
    if (!selectedAddressId) {
      toast.error("Pilih alamat pengiriman");
      return;
    }

    if (finalTotal < MIN_DELIVERY_TOTAL) {
      setShowMinDeliveryPopup(true);
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    setProcessing(true);
    const user = JSON.parse(storedUser);

    // Generate idempotency key
    const idempotencyKey = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    // Create payment
    const result = await createPayment({
      userId: user.id,
      addressId: selectedAddressId,
      notes,
      idempotencyKey,
      promoCode: promoApplied?.code,
    });

    if (!result.data) {
      toast.error(result.error);
      setProcessing(false);
      return;
    }

    const { token, order } = result.data;

    // Open Midtrans Snap
    window.snap.pay(token, {
      onSuccess: async () => {
        refreshCount();
        router.push(`/checkout/sukses?order_id=${order.orderId}`);
      },
      onPending: () => {
        refreshCount();
        toast("Menunggu pembayaran...", { description: "Silakan selesaikan pembayaran Anda" });
        router.push(`/checkout/sukses?order_id=${order.orderId}&status=pending`);
      },
      onError: () => {
        toast.error("Pembayaran gagal");
        setProcessing(false);
      },
      onClose: () => {
        toast("Pembayaran dibatalkan", { description: "Anda dapat melanjutkan pembayaran nanti" });
        setProcessing(false);
      },
    });
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  }

  const totalItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Navbar />
        <div className="flex flex-1 items-center justify-center bg-zinc-50">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  if (!cart) return null;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Script 
        src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js"}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-uX8jfJD1DrumWP1Q"}
      />
      <Navbar />

      <main className="flex-1 bg-zinc-50">
        <div className="p-4 sm:p-6">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/" className="flex items-center gap-1.5 hover:text-zinc-900">
              <Home className="h-3.5 w-3.5" />
              Beranda
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/keranjang" className="hover:text-zinc-900">Keranjang</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-zinc-900 font-medium">Checkout</span>
          </nav>

          <div className="grid gap-4 lg:grid-cols-12">
            {/* Left - Forms */}
            <div className="lg:col-span-8 space-y-4">

              {/* Shipping Address */}
              <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
                <div className="border-b border-zinc-100 bg-zinc-50/80 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-zinc-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Alamat Pengiriman</span>
                  </div>
                </div>
                <div className="p-5">
                  {addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <MapPin className="h-10 w-10 text-zinc-300" />
                      <p className="mt-3 text-sm font-medium text-zinc-900">Belum Ada Alamat Pengiriman</p>
                      <p className="mt-1 text-xs text-zinc-500">Tambahkan alamat untuk melanjutkan checkout</p>
                      <Link href="/alamat/tambah">
                        <Button className="mt-4 h-9 gap-2 bg-zinc-900 text-white text-sm">
                          <Plus className="h-4 w-4" /> Tambah Alamat
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => {
                        const LabelIcon = LABEL_ICONS[addr.label] || MapPin;
                        const isSelected = selectedAddressId === addr.id;

                        return (
                          <label
                            key={addr.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 p-4 transition-colors ${
                              isSelected
                                ? "bg-zinc-50"
                                : "hover:border-zinc-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="address"
                              value={addr.id}
                              checked={isSelected}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="sr-only"
                            />
                            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              isSelected ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
                            }`}>
                              <LabelIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-zinc-900">{addr.label}</span>
                                {addr.isDefault && (
                                  <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-white">
                                    Utama
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm font-medium text-zinc-700">{addr.name} • {addr.phone}</p>
                              <p className="mt-0.5 text-sm text-zinc-500 leading-relaxed">
                                {addr.address}, {addr.village}, {addr.district}, {addr.city}, {addr.province}, {addr.postalCode}
                              </p>
                              {addr.notes && (
                                <p className="mt-0.5 text-xs text-zinc-400 italic">Catatan: {addr.notes}</p>
                              )}
                            </div>
                            {isSelected && (
                              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-zinc-900" />
                            )}
                          </label>
                        );
                      })}

                      <Link
                        href="/alamat/tambah"
                        className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-200 p-3 text-sm font-medium text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Tambah Alamat Baru
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Disclaimer Area */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">Perhatian Area Pengiriman</h3>
                    <p className="mt-1 text-sm text-amber-800 leading-relaxed">
                      Untuk pesanan dengan alamat <span className="font-bold">di luar Kabupaten Gowa</span> tidak dapat diantarkan oleh kurir kami, kecuali Anda bersedia mengambilnya langsung ke toko (Pick-up).
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
                <div className="border-b border-zinc-100 bg-zinc-50/80 px-5 py-3 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-zinc-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Catatan Pesanan</span>
                </div>
                <div className="p-5">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    placeholder="Tambahkan catatan untuk pesanan Anda (opsional)"
                  />
                </div>
              </div>
            </div>

            {/* Right - Order Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-20 space-y-4">
                <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
                  <div className="border-b border-zinc-100 bg-zinc-50/80 px-5 py-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Pesanan Kamu</span>
                  </div>
                  <div className="p-5 space-y-4">
                    {/* Items */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cart.items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100 border border-zinc-100">
                            {item.product.thumbnail ? (
                              <img src={item.product.thumbnail} alt={item.product.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-zinc-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 line-clamp-1">{item.product.name}</p>
                            <p className="text-xs text-zinc-500">{item.quantity}x {formatPrice(item.product.price)}</p>
                          </div>
                          <p className="text-sm font-medium text-zinc-900 shrink-0">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-zinc-100" />

                    {/* Selected Address Preview */}
                    {selectedAddress && (
                      <>
                        <div className="rounded-lg bg-zinc-50 p-3">
                          <p className="text-xs font-medium text-zinc-500">Dikirim ke</p>
                          <p className="mt-1 text-sm font-medium text-zinc-900">{selectedAddress.label} — {selectedAddress.name}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{selectedAddress.city}, {selectedAddress.province}</p>
                        </div>
                        <div className="border-t border-zinc-100" />
                      </>
                    )}

                    {/* Summary */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Subtotal ({totalItems} item)</span>
                        <span className="font-medium">{formatPrice(cart.total)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Ongkos Kirim</span>
                        <span className="font-medium text-green-600">Gratis</span>
                      </div>
                      {promoApplied && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-500">Diskon ({promoApplied.code})</span>
                          <span className="font-medium text-green-600">-{formatPrice(promoApplied.discount)}</span>
                        </div>
                      )}
                    </div>

                    {/* Promo */}
                    <div className="border-t border-zinc-100" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Promo</span>
                      <button 
                        onClick={() => setIsPromoModalOpen(true)}
                        className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700"
                      >
                        <Ticket className="h-3.5 w-3.5" />
                        Lihat Promo
                      </button>
                    </div>

                    {promoApplied ? (
                      <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-green-700">Promo {promoApplied.code} berhasil diterapkan</p>
                          <p className="text-xs text-green-600">Kamu Hemat {formatPrice(promoApplied.discount)}</p>
                        </div>
                        <button onClick={handleRemovePromo} className="h-8 rounded-lg bg-zinc-900 px-3 text-xs font-medium text-white hover:bg-zinc-800 transition-colors">
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Masukkan Kode Promo"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          className="h-9 flex-1 rounded-lg border border-zinc-200 px-3 text-sm font-mono uppercase placeholder:normal-case placeholder:font-sans focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                        <button
                          onClick={handleApplyPromo}
                          disabled={applyingPromo}
                          className="h-9 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                          {applyingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Terapkan"}
                        </button>
                      </div>
                    )}

                    <div className="border-t border-zinc-100" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-900">Total Pembayaran</span>
                      <span className="text-xl font-bold text-zinc-900">{formatPrice(finalTotal)}</span>
                    </div>

                    <Button
                      className="h-11 w-full bg-zinc-900 text-white text-sm font-medium"
                      disabled={processing || !selectedAddressId}
                      onClick={handleCheckout}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Memproses...
                        </>
                      ) : (
                        "Bayar Sekarang"
                      )}
                    </Button>

                    {/* Trust */}
                    <div className="flex items-center justify-center gap-4 pt-2">
                      {[
                        { icon: Truck, text: "Gratis Ongkir" },
                        { icon: ShieldCheck, text: "Aman" },
                        { icon: Clock, text: "Cepat" },
                      ].map((item) => (
                        <div key={item.text} className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <item.icon className="h-3.5 w-3.5" />
                          {item.text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PromoModal 
        isOpen={isPromoModalOpen} 
        onClose={() => setIsPromoModalOpen(false)} 
        onApply={(code) => handleApplyPromo(code)}
        subtotal={cart.total}
      />

      {/* Minimum Delivery Popup */}
      {showMinDeliveryPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                <AlertCircle className="h-7 w-7 text-amber-600" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-zinc-900">Minimum Pembelian Rp20.000</h2>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                Untuk pesanan yang <span className="font-semibold">diantarkan</span>, minimum total pembelian adalah <span className="font-semibold text-amber-700">Rp20.000</span>. Total belanja kamu saat ini hanya <span className="font-semibold">{formatPrice(finalTotal)}</span>.
              </p>
              <p className="mt-2 text-xs text-zinc-400">
                Tambahkan produk lagi atau ambil langsung ke toko untuk pesanan di bawah Rp20.000.
              </p>
              <button
                onClick={() => setShowMinDeliveryPopup(false)}
                className="mt-5 h-10 w-full rounded-lg bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
