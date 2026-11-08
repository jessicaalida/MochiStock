import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/ProductContext';
import { MochiMascot } from '../components/MochiMascot';
import { toast } from 'sonner';

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = 'E-mail obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'E-mail inválido';
    if (!password) errs.password = 'Senha obrigatória';
    else if (password.length < 4) errs.password = 'Senha deve ter ao menos 4 caracteres';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    if (!result.success) {
      toast.error(result.message);
      setLoading(false);
    }
  };

  const handleForgot = () => {
    toast.info('Para redefinir a senha, fale com o administrador do sistema.');
  };

  const inputBase =
    'w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-medium focus:outline-none transition-all';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(160deg, #FDF0F5 0%, #F9E4EC 60%, #FAF4F0 100%)' }}
    >
      {/* Decorações */}
      <div className="absolute top-8 left-6 text-3xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>🍬</div>
      <div className="absolute top-16 right-8 text-2xl opacity-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3.5s' }}>🍭</div>
      <div className="absolute bottom-20 left-10 text-xl opacity-15 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4s' }}>🍡</div>

      <div className="w-full max-w-[390px]">
        {/* Logo + Mascote */}
        <div className="text-center mb-8">
          <MochiMascot />
          <h1 className="text-4xl font-bold mt-2" style={{ color: '#3D1C1C' }}>
            Mochi<span style={{ color: '#F4A0C0' }}>Stock</span>
          </h1>
          <p className="text-sm mt-1 font-medium" style={{ color: '#A07080' }}>
            Sistema Integrado de Gestão
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#C0A0B0' }}>
            MochiMochi Candy Store
          </p>
        </div>

        {/* Card de login */}
        <div
          className="rounded-3xl p-6 shadow-xl"
          style={{ background: '#FFFFFF', border: '1.5px solid rgba(244,160,192,0.25)' }}
        >
          <h2 className="text-lg font-bold mb-6 text-center" style={{ color: '#3D1C1C' }}>
            Boas-vindas! 👋
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-mail */}
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#F4A0C0' }} />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: undefined })); }}
                  className={inputBase}
                  style={{
                    background: errors.email ? '#FFF0F3' : '#FDF0F5',
                    border: `1.5px solid ${errors.email ? '#D95F5F' : 'rgba(244,160,192,0.4)'}`,
                    color: '#3D1C1C',
                  }}
                />
              </div>
              {errors.email && <p className="text-xs mt-1 ml-2" style={{ color: '#D95F5F' }}>{errors.email}</p>}
            </div>

            {/* Senha */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#F4A0C0' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
                  className={inputBase}
                  style={{
                    background: errors.password ? '#FFF0F3' : '#FDF0F5',
                    border: `1.5px solid ${errors.password ? '#D95F5F' : 'rgba(244,160,192,0.4)'}`,
                    color: '#3D1C1C',
                    paddingRight: '3rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: '#A07080' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1 ml-2" style={{ color: '#D95F5F' }}>{errors.password}</p>}
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-white transition-all mt-2 min-h-[56px] flex items-center justify-center gap-2"
              style={{
                background: loading ? '#E8A0B8' : 'linear-gradient(135deg, #F4A0C0 0%, #E8839E 100%)',
                boxShadow: '0 4px 16px rgba(244,160,192,0.4)',
              }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar ✨'
              )}
            </button>
          </form>

          {/* Esqueci senha */}
          <button
            type="button"
            onClick={handleForgot}
            className="w-full mt-4 text-sm font-medium text-center transition-opacity hover:opacity-70"
            style={{ color: '#A07080' }}
          >
            Esqueci minha senha
          </button>

        </div>

        <p className="text-center text-xs mt-6 opacity-40" style={{ color: '#A07080' }}>
          feito com 🍡 e muito carinho
        </p>
      </div>
    </div>
  );
}
