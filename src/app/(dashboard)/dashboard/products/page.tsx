'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardRole } from '@/components/dashboard/DashboardGuard';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import { DataTable, type Column } from '@/components/dashboard/DataTable';
import { bulkTiers } from '@/data/products';
import { generateCSV, downloadCSV } from '@/lib/csv-export';
import type { ProductPage, ProductVariant } from '@/types';
import styles from '../page.module.css';
import prodStyles from './products.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FlatVariant {
  slug: string;
  productName: string;
  sku: string;
  variant: string;
  price: number;
  category: string;
}

const EMPTY_VARIANT: ProductVariant = {
  sku: '',
  name: '',
  variant: '',
  price: 0,
  image: '',
};

const EMPTY_PRODUCT: ProductPage = {
  slug: '',
  name: '',
  category: 'Magnetic',
  variants: [{ ...EMPTY_VARIANT }],
  defaultVariantIndex: 0,
  description: '',
  features: [],
  specifications: {},
  moods: [],
  audiences: [],
  textures: [],
  metaTitle: '',
  metaDescription: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProductsPage() {
  const { user } = useAuth();
  const role = useDashboardRole();
  const isAdmin = role === 'admin';

  const [products, setProducts] = useState<ProductPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<ProductPage>({ ...EMPTY_PRODUCT });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ProductPage | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; slug?: string } | null>(null);

  // Spec editor state
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // ------ Fetch ------

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ------ Flatten for table ------

  const allVariants: FlatVariant[] = products.flatMap((page) =>
    page.variants.map((v) => ({
      slug: page.slug,
      productName: page.name,
      sku: v.sku,
      variant: v.variant,
      price: v.price,
      category: page.category,
    }))
  );

  // ------ Form handlers ------

  function openAdd() {
    setEditingSlug(null);
    setForm({ ...EMPTY_PRODUCT, variants: [{ ...EMPTY_VARIANT }] });
    setFormError(null);
    setNewSpecKey('');
    setNewSpecValue('');
    setShowForm(true);
  }

  function openEdit(product: ProductPage) {
    setEditingSlug(product.slug);
    setForm(JSON.parse(JSON.stringify(product)));
    setFormError(null);
    setNewSpecKey('');
    setNewSpecValue('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingSlug(null);
    setFormError(null);
  }

  function updateFormField<K extends keyof ProductPage>(key: K, value: ProductPage[K]) {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      // Auto-generate slug from name when creating
      if (key === 'name' && !editingSlug) {
        updated.slug = slugify(value as string);
      }
      return updated;
    });
  }

  function updateVariant(index: number, field: keyof ProductVariant, value: string | number) {
    setForm((prev) => {
      const variants = [...prev.variants];
      variants[index] = { ...variants[index], [field]: value };
      // Sync variant name with product name
      if (field !== 'name') {
        variants[index].name = prev.name;
      }
      return { ...prev, variants };
    });
  }

  function addVariant() {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...EMPTY_VARIANT, name: prev.name }],
    }));
  }

  function removeVariant(index: number) {
    if (form.variants.length <= 1) return;
    setForm((prev) => {
      const variants = prev.variants.filter((_, i) => i !== index);
      return {
        ...prev,
        variants,
        defaultVariantIndex: Math.min(prev.defaultVariantIndex, variants.length - 1),
      };
    });
  }

  function addSpec() {
    if (!newSpecKey.trim()) return;
    setForm((prev) => ({
      ...prev,
      specifications: { ...prev.specifications, [newSpecKey.trim()]: newSpecValue.trim() },
    }));
    setNewSpecKey('');
    setNewSpecValue('');
  }

  function removeSpec(key: string) {
    setForm((prev) => {
      const specs = { ...prev.specifications };
      delete specs[key];
      return { ...prev, specifications: specs };
    });
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setFormError(null);

    // Sync variant names
    const productToSave = {
      ...form,
      variants: form.variants.map((v) => ({ ...v, name: form.name })),
    };

    try {
      const token = await user.getIdToken();
      const isEdit = editingSlug !== null;
      const url = isEdit ? `/api/admin/products/${editingSlug}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productToSave),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      const savedSlug = productToSave.slug;
      closeForm();
      fetchProducts();
      setToast({
        message: isEdit ? 'Product updated — storefront synced' : 'Product created — storefront synced',
        slug: savedSlug,
      });
      setTimeout(() => setToast(null), 6000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  // ------ Delete handlers ------

  async function handleDelete() {
    if (!user || !deleteTarget) return;
    setDeleting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/products/${deleteTarget.slug}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      setDeleteTarget(null);
      fetchProducts();
      setToast({ message: 'Product deleted — storefront synced' });
      setTimeout(() => setToast(null), 6000);
    } catch (err) {
      console.error(err);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  // ------ Table columns ------

  const columns: Column<FlatVariant>[] = [
    { key: 'productName', label: 'Product' },
    { key: 'variant', label: 'Variant' },
    {
      key: 'sku',
      label: 'SKU',
      render: (item) => <code className={styles.mono}>{item.sku}</code>,
    },
    {
      key: 'price',
      label: 'Price',
      align: 'right',
      render: (item) => `$${item.price.toFixed(2)}`,
    },
    { key: 'category', label: 'Category' },
  ];

  if (isAdmin) {
    columns.push({
      key: 'actions',
      label: '',
      align: 'right',
      render: (item) => {
        const product = products.find((p) => p.slug === item.slug);
        if (!product) return null;
        return (
          <div className={prodStyles.actions}>
            <button
              className={prodStyles.editBtn}
              onClick={(e) => {
                e.stopPropagation();
                openEdit(product);
              }}
            >
              Edit
            </button>
            <button
              className={prodStyles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(product);
              }}
            >
              Delete
            </button>
          </div>
        );
      },
    });
  }

  // ------ Render ------

  if (loading) {
    return (
      <>
        <DashboardTopbar title="Products" />
        <div className={styles.content}>
          <div className={styles.loading}>Loading products&hellip;</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <DashboardTopbar title="Products" />
        <div className={styles.content}>
          <div className={styles.error}>{error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardTopbar title="Products" />
      <div className={styles.content}>
        {/* Header bar */}
        <div className={prodStyles.headerBar}>
          <span className={prodStyles.headerCount}>
            {products.length} products, {allVariants.length} variants
          </span>
          <button
            className={styles.loadMoreBtn}
            onClick={() => {
              const csv = generateCSV(allVariants, [
                { header: 'Product', accessor: (v) => v.productName },
                { header: 'Variant', accessor: (v) => v.variant },
                { header: 'SKU', accessor: (v) => v.sku },
                { header: 'Price', accessor: (v) => v.price.toFixed(2) },
                { header: 'Category', accessor: (v) => v.category },
              ]);
              downloadCSV(csv, 'products.csv');
            }}
            disabled={allVariants.length === 0}
          >
            Export CSV
          </button>
          {isAdmin && (
            <button className={prodStyles.addBtn} onClick={openAdd}>
              + Add Product
            </button>
          )}
        </div>

        {/* Product table */}
        <div className={styles.section}>
          <DataTable
            columns={columns}
            data={allVariants}
            keyExtractor={(item) => item.sku}
            emptyMessage="No products found"
          />
        </div>

        {/* Bulk tiers */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Bulk Discount Tiers</h2>
          <div className={styles.tierGrid}>
            {bulkTiers.map((tier) => (
              <div key={tier.qty} className={styles.tierCard}>
                <span className={styles.tierQty}>{tier.qty}+</span>
                <span className={styles.tierDiscount}>{tier.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Product Form Modal ---- */}
      {showForm && (
        <div className={prodStyles.overlay} onClick={closeForm}>
          <div className={prodStyles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={prodStyles.modalHeader}>
              <h2>{editingSlug ? 'Edit Product' : 'Add Product'}</h2>
              <button className={prodStyles.closeBtn} onClick={closeForm} aria-label="Close">
                &times;
              </button>
            </div>

            <div className={prodStyles.modalBody}>
              {formError && <div className={prodStyles.formError}>{formError}</div>}

              {/* Basic fields */}
              <fieldset className={prodStyles.fieldset}>
                <legend>Basic Info</legend>
                <label className={prodStyles.label}>
                  Name
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateFormField('name', e.target.value)}
                    className={prodStyles.input}
                    autoFocus
                  />
                </label>
                <label className={prodStyles.label}>
                  Slug
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => updateFormField('slug', e.target.value)}
                    className={prodStyles.input}
                    disabled={editingSlug !== null}
                  />
                </label>
                <label className={prodStyles.label}>
                  Category
                  <select
                    value={form.category}
                    onChange={(e) => updateFormField('category', e.target.value as ProductPage['category'])}
                    className={prodStyles.select}
                  >
                    <option value="Magnetic">Magnetic</option>
                    <option value="Squishy">Squishy</option>
                    <option value="Clicky">Clicky</option>
                    <option value="Stretchy">Stretchy</option>
                    <option value="Desk Toy">Desk Toy</option>
                    <option value="Collectible">Collectible</option>
                    <option value="Gift Set">Gift Set</option>
                  </select>
                </label>
              </fieldset>

              {/* Variants */}
              <fieldset className={prodStyles.fieldset}>
                <legend>
                  Variants ({form.variants.length})
                  <button
                    type="button"
                    className={prodStyles.addVariantBtn}
                    onClick={addVariant}
                  >
                    + Add Variant
                  </button>
                </legend>
                {form.variants.map((v, i) => (
                  <div key={i} className={prodStyles.variantRow}>
                    <input
                      type="text"
                      placeholder="SKU"
                      value={v.sku}
                      onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                      className={prodStyles.input}
                    />
                    <input
                      type="text"
                      placeholder="Variant (e.g. 5mg)"
                      value={v.variant}
                      onChange={(e) => updateVariant(i, 'variant', e.target.value)}
                      className={prodStyles.input}
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={v.price || ''}
                      onChange={(e) => updateVariant(i, 'price', parseFloat(e.target.value) || 0)}
                      className={prodStyles.input}
                      min="0"
                      step="0.01"
                    />
                    <input
                      type="text"
                      placeholder="Image path"
                      value={v.image}
                      onChange={(e) => updateVariant(i, 'image', e.target.value)}
                      className={prodStyles.input}
                    />
                    <label className={prodStyles.defaultLabel}>
                      <input
                        type="radio"
                        name="defaultVariant"
                        checked={form.defaultVariantIndex === i}
                        onChange={() => updateFormField('defaultVariantIndex', i)}
                      />
                      Default
                    </label>
                    {form.variants.length > 1 && (
                      <button
                        type="button"
                        className={prodStyles.removeBtn}
                        onClick={() => removeVariant(i)}
                        aria-label="Remove variant"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </fieldset>

              {/* Description */}
              <fieldset className={prodStyles.fieldset}>
                <legend>Content</legend>
                <label className={prodStyles.label}>
                  Description (HTML)
                  <textarea
                    value={form.description}
                    onChange={(e) => updateFormField('description', e.target.value)}
                    className={prodStyles.textarea}
                    rows={4}
                  />
                </label>
                <label className={prodStyles.label}>
                  Features (one per line)
                  <textarea
                    value={form.features.join('\n')}
                    onChange={(e) => updateFormField('features', e.target.value.split('\n').filter(Boolean))}
                    className={prodStyles.textarea}
                    rows={4}
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  />
                </label>
              </fieldset>

              {/* Specifications */}
              <fieldset className={prodStyles.fieldset}>
                <legend>Specifications</legend>
                {Object.entries(form.specifications).map(([key, val]) => (
                  <div key={key} className={prodStyles.specRow}>
                    <span className={prodStyles.specKey}>{key}</span>
                    <span className={prodStyles.specVal}>{val}</span>
                    <button
                      type="button"
                      className={prodStyles.removeBtn}
                      onClick={() => removeSpec(key)}
                      aria-label={`Remove ${key}`}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <div className={prodStyles.specAdd}>
                  <input
                    type="text"
                    placeholder="Key"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    className={prodStyles.input}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    className={prodStyles.input}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSpec();
                      }
                    }}
                  />
                  <button type="button" className={prodStyles.addSpecBtn} onClick={addSpec}>
                    Add
                  </button>
                </div>
              </fieldset>

              {/* SEO */}
              <fieldset className={prodStyles.fieldset}>
                <legend>SEO</legend>
                <label className={prodStyles.label}>
                  Meta Title
                  <input
                    type="text"
                    value={form.metaTitle}
                    onChange={(e) => updateFormField('metaTitle', e.target.value)}
                    className={prodStyles.input}
                  />
                </label>
                <label className={prodStyles.label}>
                  Meta Description
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) => updateFormField('metaDescription', e.target.value)}
                    className={prodStyles.textarea}
                    rows={2}
                  />
                </label>
              </fieldset>
            </div>

            <div className={prodStyles.modalFooter}>
              <button className={prodStyles.cancelBtn} onClick={closeForm} disabled={saving}>
                Cancel
              </button>
              <button className={prodStyles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving\u2026' : editingSlug ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Sync Toast ---- */}
      {toast && (
        <div className={prodStyles.toast} role="status" aria-live="polite">
          <span>{toast.message}</span>
          {toast.slug && (
            <a
              href={`/products/${toast.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={prodStyles.toastLink}
            >
              View on site
            </a>
          )}
          <button
            className={prodStyles.toastClose}
            onClick={() => setToast(null)}
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      )}

      {/* ---- Delete Confirmation ---- */}
      {deleteTarget && (
        <div className={prodStyles.overlay} onClick={() => setDeleteTarget(null)}>
          <div
            className={prodStyles.confirmDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete &ldquo;{deleteTarget.name}&rdquo;?</h3>
            <p>
              This will permanently remove the product and all its variants.
              This action cannot be undone.
            </p>
            <div className={prodStyles.confirmActions}>
              <button
                className={prodStyles.cancelBtn}
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className={prodStyles.confirmDeleteBtn}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting\u2026' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
