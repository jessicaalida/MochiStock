import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { MochiButton } from '../components/MochiButton';
import { FormInput } from '../components/FormInput';
import { useProducts } from '../context/ProductContext';
import { toast } from 'sonner';
import { validateExpiry } from '../../lib/format';

const emojiMap: Record<string, string> = {
  Biscoitos: '🍪',
  Bebidas: '🥤',
  Doces: '🍬',
  Chocolates: '🍫',
  Salgados: '🥨',
  Balas: '🍭',
  Gomas: '🍡',
};

export function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { products, updateProduct } = useProducts();

  const product = products.find((p) => p.id === id);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    expiry: '',
    price: '',
    minStock: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        quantity: product.quantity.toString(),
        expiry: product.expiry,
        price: product.price.toString(),
        minStock: product.minStock !== undefined ? product.minStock.toString() : '',
      });
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FDF0F5' }}>
        <div className="text-center">
          <p className="mb-4 font-medium" style={{ color: '#A07080' }}>Produto não encontrado</p>
          <MochiButton onClick={() => navigate('/inventory')}>Voltar ao Estoque</MochiButton>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Permite salvar um produto já vencido sem mexer na validade (ex.: ajustar quantidade);
    // a regra de data passada vale quando a validade é alterada.
    const expiryError =
      formData.expiry === product.expiry
        ? null
        : validateExpiry(formData.expiry);
    if (expiryError) {
      toast.error(expiryError);
      return;
    }
    const quantity = parseInt(formData.quantity);
    const price = parseFloat(formData.price);
    if (!(quantity >= 0) || !(price >= 0)) {
      toast.error('Quantidade e preço não podem ser negativos.');
      return;
    }
    const result = await updateProduct({
      ...product,
      name: formData.name,
      category: formData.category,
      quantity,
      expiry: formData.expiry,
      price,
      minStock: formData.minStock ? parseInt(formData.minStock) : undefined,
      emoji: emojiMap[formData.category] || product.emoji,
    });
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    navigate('/inventory');
  };

  const selectStyle =
    'w-full px-4 py-3 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 transition-colors';

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(160deg, #FDF0F5 0%, #F9E4EC 60%, #FAF4F0 100%)' }}>
      <div className="max-w-[390px] mx-auto">
        {/* Header */}
        <div
          className="px-6 pt-10 pb-6 rounded-b-3xl shadow-md"
          style={{ background: 'linear-gradient(135deg, #5C2A2A 0%, #3D1C1C 100%)' }}
        >
          <button
            onClick={() => navigate(-1)}
            className="mb-4 p-2 rounded-xl transition-colors"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            aria-label="Voltar"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Editar Produto</h1>
        </div>

        {/* Form */}
        <div className="px-6 mt-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <FormInput
              label="Produto"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="Ex: Pocky Morango"
              required
            />

            <div>
              <label className="block mb-2 text-sm font-semibold" style={{ color: '#3D1C1C' }}>
                Categoria <span style={{ color: '#D95F5F' }}>*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className={selectStyle}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid rgba(244,160,192,0.4)',
                  color: formData.category ? '#3D1C1C' : '#A07080',
                }}
              >
                <option value="">Selecione uma categoria</option>
                {Object.keys(emojiMap).map((cat) => (
                  <option key={cat} value={cat}>
                    {emojiMap[cat]} {cat}
                  </option>
                ))}
              </select>
            </div>

            <FormInput
              label="Quantidade"
              type="number"
              value={formData.quantity}
              onChange={(value) => setFormData({ ...formData, quantity: value })}
              placeholder="Ex: 50"
              required
            />

            <FormInput
              label="Estoque Mínimo"
              type="number"
              value={formData.minStock}
              onChange={(value) => setFormData({ ...formData, minStock: value })}
              placeholder="Ex: 20 (opcional)"
            />

            <FormInput
              label="Validade"
              type="text"
              value={formData.expiry}
              onChange={(value) => setFormData({ ...formData, expiry: value })}
              placeholder="DD/MM/AAAA"
              required
            />

            <FormInput
              label="Preço (R$)"
              type="number"
              value={formData.price}
              onChange={(value) => setFormData({ ...formData, price: value })}
              placeholder="Ex: 12,90"
              required
            />

            <div className="pt-3">
              <MochiButton type="submit" fullWidth>
                Salvar Alterações
              </MochiButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
