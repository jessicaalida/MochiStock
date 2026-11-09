import React from 'react';
import { Edit2, Trash2, RefreshCw } from 'lucide-react';
import { Product } from '../types';
import { formatBRL, expiryStatus, expiryLabel } from '../../lib/format';

interface ProductCardProps {
  product: Product;
  /** Ausentes para o operador: os botões de editar e excluir não aparecem. */
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  onReplenishment?: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDelete, onReplenishment }: ProductCardProps) {
  const isLowStock = product.minStock !== undefined && product.quantity < product.minStock;
  const expiry = expiryStatus(product.expiry);
  const expiryColors =
    expiry.status === 'expired'
      ? { bg: '#FFE0E0', fg: '#C24141' }
      : { bg: '#FFF1DC', fg: '#B45309' };
  const alertBorder = expiry.status === 'expired' ? 'rgba(194,65,65,0.45)' : null;

  return (
    <div
      className="rounded-2xl p-4 transition-shadow hover:shadow-lg"
      style={{
        background: '#FFFFFF',
        border: `1.5px solid ${alertBorder ?? (isLowStock ? 'rgba(217,95,95,0.35)' : 'rgba(244,160,192,0.2)')}`,
        boxShadow: `0 2px 12px ${isLowStock ? 'rgba(217,95,95,0.1)' : 'rgba(244,160,192,0.15)'}`,
      }}
    >
      <div className="flex gap-3">
        {/* Imagem / Emoji */}
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ background: isLowStock ? '#FFF0F0' : '#F9E4EC' }}
        >
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">{product.emoji || '🍬'}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold truncate text-sm" style={{ color: '#3D1C1C' }}>
              {product.name}
            </h3>
            {/* Status badge */}
            <span
              className="text-xs px-2 py-0.5 rounded-lg font-semibold flex-shrink-0"
              style={{
                background: isLowStock ? '#FFE0E0' : '#E0FFE8',
                color: isLowStock ? '#D95F5F' : '#16A34A',
              }}
            >
              {isLowStock ? '⚠️ Baixo' : '✓ Normal'}
            </span>
          </div>

          <p className="text-xs mb-2" style={{ color: '#A07080' }}>
            {product.category}
          </p>

          <div className="flex items-center gap-2 flex-wrap text-xs mb-1">
            <span
              className="px-2 py-0.5 rounded-lg font-medium"
              style={{ background: isLowStock ? '#FFE0E0' : '#F9E4EC', color: isLowStock ? '#D95F5F' : '#7A4A55' }}
            >
              Qtd: {product.quantity}
              {product.minStock !== undefined && ` / mín ${product.minStock}`}
            </span>
            <span style={{ color: '#A07080' }}>Val: {product.expiry}</span>
          </div>

          {expiry.status !== 'ok' && (
            <span
              className="inline-block text-xs px-2 py-0.5 rounded-lg font-semibold mb-1"
              style={{ background: expiryColors.bg, color: expiryColors.fg }}
            >
              {expiry.status === 'expired' ? '⛔ ' : '⏳ '}
              {expiryLabel(product.expiry)}
            </span>
          )}

          <p className="font-bold text-sm" style={{ color: '#3D1C1C' }}>
            {formatBRL(product.price)}
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-2 justify-center flex-shrink-0">
          {onEdit && (
          <button
            onClick={() => onEdit(product)}
            className="p-2 rounded-xl transition-colors"
            style={{ background: '#F9E4EC' }}
            aria-label="Editar"
          >
            <Edit2 className="w-4 h-4" style={{ color: '#F4A0C0' }} />
          </button>
          )}
          {onDelete && (
          <button
            onClick={() => onDelete(product.id)}
            className="p-2 rounded-xl transition-colors hover:bg-red-100"
            style={{ background: '#FDF0F5' }}
            aria-label="Excluir"
          >
            <Trash2 className="w-4 h-4" style={{ color: '#D95F5F' }} />
          </button>
          )}
          {isLowStock && onReplenishment && (
            <button
              onClick={() => onReplenishment(product)}
              className="p-2 rounded-xl transition-colors"
              style={{ background: '#FFE0E0' }}
              aria-label="Solicitar Reposição"
              title="Solicitar Reposição"
            >
              <RefreshCw className="w-4 h-4" style={{ color: '#D95F5F' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
