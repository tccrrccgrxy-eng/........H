
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogIn, LogOut, LayoutDashboard, Search, Menu, X, Trash2, Plus, Minus, CheckCircle } from 'lucide-react';

// Firebase imports (سيتم تفعيلها بمجرد وضع المفاتيح)
// import { auth, db, googleProvider } from './firebase';
// import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
// import { doc, setDoc, getDoc } from "firebase/firestore";

import { Product, CartItem, UserProfile, Order, UserRole } from './types';

// Contexts
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Components ---

const Navbar = () => {
  const { cart } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">متجرنا</Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-blue-600">الرئيسية</Link>
          <div className="relative group flex items-center gap-2">
            <Search size={20} className="text-gray-500" />
            <input 
              type="text" 
              placeholder="ابحث عن منتج..." 
              className="bg-gray-100 px-4 py-1 rounded-full outline-none focus:ring-2 focus:ring-blue-300 w-48"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full">
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="p-2 hover:bg-gray-100 rounded-full"><User size={24} /></Link>
              {isAdmin && <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-full"><LayoutDashboard size={24} /></Link>}
              <button onClick={logout} className="p-2 hover:bg-red-50 text-red-500 rounded-full"><LogOut size={24} /></button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <LogIn size={20} />
              <span>دخول</span>
            </Link>
          )}

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 flex flex-col gap-4">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>الرئيسية</Link>
          <Link to="/cart" onClick={() => setIsMenuOpen(false)}>السلة</Link>
          {isAdmin && <Link to="/admin" onClick={() => setIsMenuOpen(false)}>لوحة التحكم</Link>}
        </div>
      )}
    </nav>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col h-full group">
      <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden rounded-lg mb-4">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-bold text-blue-600">{product.price} ر.س</span>
          <span className="text-xs text-gray-400">متبقي: {product.stock}</span>
        </div>
      </div>
      <button 
        onClick={() => addToCart(product)}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <ShoppingCart size={18} />
        إضافة للسلة
      </button>
    </div>
  );
};

// --- Pages ---

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setProducts([
        { id: '1', name: 'هاتف ذكي S24', price: 3500, description: 'أحدث الهواتف الذكية مع كاميرا مذهلة وشاشة فائقة الوضوح.', category: 'إلكترونيات', imageUrl: 'https://picsum.photos/seed/phone/400/400', featured: true, stock: 10 },
        { id: '2', name: 'سماعات بلوتوث', price: 450, description: 'سماعات عازلة للضوضاء ذات جودة صوت استثنائية.', category: 'إكسسوارات', imageUrl: 'https://picsum.photos/seed/headphones/400/400', featured: true, stock: 25 },
        { id: '3', name: 'ساعة ذكية', price: 900, description: 'تتبع نشاطك وصحتك بكل سهولة مع هذه الساعة الأنيقة.', category: 'إلكترونيات', imageUrl: 'https://picsum.photos/seed/watch/400/400', featured: false, stock: 15 },
        { id: '4', name: 'جهاز لابتوب برو', price: 5500, description: 'أداء قوي للعمل والألعاب مع تصميم نحيف وخفيف.', category: 'إلكترونيات', imageUrl: 'https://picsum.photos/seed/laptop/400/400', featured: true, stock: 5 },
        { id: '5', name: 'كاميرا احترافية', price: 2800, description: 'التقط أفضل اللحظات بدقة عالية جداً.', category: 'تصوير', imageUrl: 'https://picsum.photos/seed/camera/400/400', featured: false, stock: 8 },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <div className="p-10 text-center">جاري التحميل...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-16 mb-12 text-white flex flex-col md:flex-row items-center gap-8">
        <div className="md:w-1/2 text-center md:text-right">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">أفضل العروض والمنتجات في مكان واحد</h1>
          <p className="text-xl mb-8 opacity-90">استمتع بتجربة تسوق فريدة مع شحن سريع ودفع عند الاستلام</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors">تسوق الآن</button>
        </div>
        <div className="md:w-1/2">
          <img src="https://picsum.photos/seed/shop/600/400" alt="Hero" className="rounded-xl shadow-2xl" />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-8">منتجات مميزة</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.filter(p => p.featured).map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    setProduct({ id: '1', name: 'هاتف ذكي S24', price: 3500, description: 'أحدث الهواتف الذكية مع كاميرا مذهلة وشاشة فائقة الوضوح. يأتي بمعالج ثماني النواة وبطارية تدوم طويلاً. مثالي للألعاب والتصوير الفوتوغرافي.', category: 'إلكترونيات', imageUrl: 'https://picsum.photos/seed/phone/800/800', featured: true, stock: 10 });
  }, [id]);

  if (!product) return <div className="p-10 text-center">جاري تحميل المنتج...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-12 flex flex-col md:flex-row gap-12">
        <div className="md:w-1/2">
          <img src={product.imageUrl} alt={product.name} className="w-full rounded-xl shadow-lg" />
        </div>
        <div className="md:w-1/2 flex flex-col justify-center">
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold w-fit mb-4">{product.category}</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 text-lg mb-6 leading-relaxed">{product.description}</p>
          <div className="text-4xl font-bold text-blue-600 mb-8">{product.price} ر.س</div>
          <button 
            onClick={() => addToCart(product)}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-3 text-lg shadow-lg"
          >
            <ShoppingCart size={24} />
            إضافة للسلة
          </button>
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-white p-12 rounded-2xl shadow-sm inline-block">
          <ShoppingCart size={64} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold mb-4">سلة المشتريات فارغة</h2>
          <Link to="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">تصفح المنتجات</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">سلة المشتريات</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
              <img src={item.imageUrl} className="w-24 h-24 object-cover rounded-lg" />
              <div className="flex-1">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-blue-600 font-semibold">{item.price} ر.س</p>
              </div>
              <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-lg">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1"><Minus size={18} /></button>
                <span className="font-bold w-8 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1"><Plus size={18} /></button>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
            </div>
          ))}
        </div>
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold mb-6">ملخص الطلب</h2>
            <div className="pt-4 border-t flex justify-between text-xl mb-6">
              <span className="font-bold">الإجمالي:</span>
              <span className="font-bold text-blue-600">{cartTotal} ر.س</span>
            </div>
            <button onClick={() => navigate('/checkout')} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg">إتمام الطلب</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const { cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      clearCart();
    }, 2000);
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-white p-12 rounded-2xl shadow-sm inline-block">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
          <h2 className="text-3xl font-bold mb-4">تم الطلب بنجاح!</h2>
          <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">العودة للرئيسية</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>
      <form onSubmit={handleOrderSubmit} className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
            <input required className="w-full px-4 py-3 bg-gray-50 border rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
            <input required className="w-full px-4 py-3 bg-gray-50 border rounded-xl" />
          </div>
        </div>
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">العنوان بالتفصيل</label>
          <textarea required className="w-full px-4 py-3 bg-gray-50 border rounded-xl h-32"></textarea>
        </div>
        <div className="p-4 border-2 border-blue-600 bg-blue-50 rounded-xl mb-8 flex justify-between items-center">
          <span className="font-bold">الدفع عند الاستلام (COD)</span>
          <CheckCircle className="text-blue-600" />
        </div>
        <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg">تأكيد الطلب بمبلغ {cartTotal} ر.س</button>
      </form>
    </div>
  );
};

const LoginPage = () => {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    navigate('/');
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8">تسجيل الدخول</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" placeholder="name@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">دخول</button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">أو عبر</span></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          الدخول بواسطة Google
        </button>

        <p className="mt-6 text-center text-gray-500">
          ليس لديك حساب؟ <Link to="/register" className="text-blue-600 font-bold">سجل الآن</Link>
        </p>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(name, email, password);
    navigate('/');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8">إنشاء حساب جديد</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">الاسم بالكامل</label>
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-xl" placeholder="أحمد علي" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-xl" placeholder="name@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">كلمة المرور</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-xl" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">تسجيل</button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'users'>('orders');
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">لوحة تحكم المدير</h1>
      <div className="flex gap-4 mb-8">
        <button onClick={() => setActiveTab('orders')} className={`px-6 py-2 rounded-full font-bold ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-white'}`}>الطلبات</button>
        <button onClick={() => setActiveTab('products')} className={`px-6 py-2 rounded-full font-bold ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-white'}`}>المنتجات</button>
      </div>
      <div className="bg-white rounded-2xl p-6 border text-center text-gray-500 italic">سيتم عرض البيانات هنا بمجرد ربط Firebase بنجاح.</div>
    </div>
  );
};

// --- Providers & Hooks ---

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

// Fix: Explicitly typing CartProvider to ensure children prop is recognized
const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };
  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.id !== productId));
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(productId);
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };
  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  return <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}>{children}</CartContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Fix: Explicitly typing AuthProvider to ensure children prop is recognized
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, pass: string) => {
    // محاكاة تسجيل الدخول (سيتم استبدالها بـ Firebase)
    const role: UserRole = email.includes('admin') ? 'admin' : 'user';
    setUser({ uid: '123', email, displayName: email.split('@')[0], role, createdAt: Date.now() });
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    // محاكاة تسجيل الدخول بـ Google
    setUser({ uid: 'g-123', email: 'google@test.com', displayName: 'Google User', role: 'user', createdAt: Date.now() });
    setLoading(false);
  };

  const register = async (name: string, email: string, pass: string) => {
    setUser({ uid: '124', email, displayName: name, role: 'user', createdAt: Date.now() });
  };

  const logout = () => setUser(null);
  const isAdmin = user?.role === 'admin';

  return <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, isAdmin, loading }}>{children}</AuthContext.Provider>;
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </main>
            <footer className="bg-white border-t py-12 text-center text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} جميع الحقوق محفوظة لمتجرنا الحديث.
            </footer>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;

const useParams = <T,>() => {
  const [params, setParams] = useState<T>({} as T);
  useEffect(() => {
    const hash = window.location.hash;
    const parts = hash.split('/');
    const id = parts[parts.length - 1];
    setParams({ id } as unknown as T);
  }, []);
  return params;
};
