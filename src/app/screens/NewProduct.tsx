import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { MochiButton } from '../components/MochiButton';
import { FormInput } from '../components/FormInput';
import { useProducts } from '../context/ProductContext';
import { Product } from '../types';
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

export function NewProduct() {
  const navigate = useNavigate();
  const { addProduct } = useProducts();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    expiry: '',
    price: '',
    minStock: '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const expiryError = validateExpiry(formData.expiry);
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
    const newProduct: Omit<Product, 'id'> = {
      name: formData.name,
      category: formData.category,
      quantity,
      expiry: formData.expiry,
      price,
      minStock: formData.minStock ? parseInt(formData.minStock) : undefined,
      emoji: emojiMap[formData.category] || '🍬',
    };
    setSaving(true);
    const result = await addProduct(newProduct);
    setSaving(false);
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
          style={{ background: 'linear-gradient(135deg, #F4A0C0 0%, #E8839E 100%)' }}
        >
          <button
            onClick={() => navigate(-1)}
            className="mb-4 p-2 rounded-xl transition-colors"
            style={{ background: 'rgba(255,255,255,0.2)' }}
            aria-label="Voltar"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Novo Produto</h1>
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
              <MochiButton type="submit" fullWidth disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Produto'}
              </MochiButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
