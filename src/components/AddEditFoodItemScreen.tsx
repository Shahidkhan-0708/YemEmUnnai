import React, { useEffect, useRef, useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle, ShoppingCart, MapPin } from 'lucide-react';
import { createFoodItem, uploadFoodPhoto } from '../lib/api';
import { useModalA11y } from '../lib/useModalA11y';
import { isBackendConfigured } from '../lib/supabase';
import { useVendorSession } from '../lib/hooks';
import { Stepper } from './Stepper';
import type { FoodCategory, ActionType } from '../lib/types';

interface AddEditFoodItemScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onPublished?: (item: { name: string; price: number }) => void;
}

/**
 * Screen 05 — "Add & Edit Food Item" bottom sheet, 1:1 from
 * figma_svgs/05_add_edit_food_item.svg (375 × 812):
 *   - Sheet ........ x=13 y=174 w=349 h=611 rx=27 #E8ECEF, white stroke .85, soft shadow
 *   - Handle ....... 45×4 rx=2 #D6DCE2 (y=183)
 *   - Title ........ "Add & Edit Food Item" 17px w800 (baseline y=215)
 *   - Subtitle ..... "Manage live canteen inventory" 11px w600 #7A6658 (y=231)
 *   - Close ........ 28px circle #DDE7E1 at (334,199), X 18px #1F140A sw 2.2
 *   - Title input .. label 13px w700 (y=254); input x=29 y=265 w=317 h=43 rx=21 inset,
 *                    placeholder "Add food item" 12px w500 #6B8075
 *   - Category ..... label 13px w700 (y=336); two 154×43 rx=20 inset selects at x=29/x=192,
 *                    text 13px w600 at x+14, chevron 18px #FE7200 at right
 *   - Price ........ label 13px w700 (y=423); input 317×43 rx=21 inset, "₹ Enter price"
 *   - Veg toggle ... "Vegetarian Only" 13px w700 (y=508) + "Pure veg preparation" 10px w500;
 *                    switch 50×28 rx=14 #FE7200, knob d=22 at RIGHT (cx=332)
 *   - Upload ....... x=29 y=539 w=317 h=143 rx=20 dashed #9BAFA3, arrow-up icon 30px
 *                    #789184, "Upload Photo" 14px w600 #7A6658, "JPG or PNG" 10px #71867A
 *   - CTA .......... x=29 y=710 w=317 h=47 rx=12 #FE7200 "Publish to YEMEMUNNAI" 14px w700
 */
export const AddEditFoodItemScreen: React.FC<AddEditFoodItemScreenProps> = ({
  isOpen,
  onClose,
  onPublished
}) => {
  const { vendor } = useVendorSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('cooked');
  const [actionType, setActionType] = useState<ActionType>('order');
  const [price, setPrice] = useState('');
  const [vegetarian, setVegetarian] = useState(true);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitLock = useRef(false);
  const sheetRef = useModalA11y<HTMLDivElement>(isOpen, () => { if (!submitLock.current) onClose(); });
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);
  useEffect(() => {
    if (!photoPreview) return;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  if (!isOpen) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) { setError('Choose a JPG or PNG photo.'); return; }
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5MB.');
      return;
    }
    setError(null);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setUploadedUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLock.current) return;
    setError(null);

    if (!vendor) {
      setError('Sign in as a vendor first.');
      return;
    }
    const priceNum = Number(price);
    if (!name.trim() || !price.trim() || !Number.isFinite(priceNum) || priceNum < 0) {
      setError('Please enter a valid name and price.');
      return;
    }

    submitLock.current = true;
    setSubmitting(true);
    try {
      // 1. Upload photo (live mode only)
      let imageUrl: string | null = uploadedUrl;
      if (photo && isBackendConfigured && !uploadedUrl) {
        imageUrl = await uploadFoodPhoto(photo);
        if (!imageUrl) {
          setError('Photo upload failed — check your connection and try again.');
          setSubmitting(false);
          return;
        }
        setUploadedUrl(imageUrl);
      }

      // 2. Insert the item
      const created = await createFoodItem(vendor.vendorId, {
        name: name.trim(),
        price: priceNum,
        category,
        actionType,
        inStock: true,
        imageUrl,
        isVeg: vegetarian
      });
      if (!created && isBackendConfigured) {
        setError('Could not publish the item. Try again.');
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setSubmitted(true);
      closeTimer.current = setTimeout(() => {
        setSubmitted(false);
        onPublished?.({ name: name.trim(), price: priceNum });
        onClose();
        // reset form
        setName('');
        setVegetarian(true);
        setCategory('cooked');
        setPrice('');
        setActionType('order');
        setPhoto(null);
        setPhotoPreview(null);
        setUploadedUrl(null);
      }, 1200);
    } catch {
      setSubmitting(false);
      setError('Something went wrong. Please try again.');
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center"
      style={{ background: 'rgba(3, 42, 21, 0.43)' }}
      onClick={() => { if (!submitting) onClose(); }}
    >
      {/* Sheet x=13 y=174 w=349 h=611 rx=27 */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Add food item"
        className="relative w-full max-w-lg max-h-[calc(100dvh-1.5rem)] rounded-[27px] bg-[#E8ECEF] border border-white/60 overflow-y-auto"
        style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4.5">
            <CheckCircle className="w-14 h-14 text-[#FE7200]" />
            <h3 className="text-[17px] font-extrabold text-[#1F140A] mt-3">Item Published!</h3>
            <p className="text-[11px] font-semibold text-[#7A6658] mt-1">
              {name} is now live on YEMEMUNNAI.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <fieldset disabled={submitting} className="min-w-0 border-0 p-0">
            {/* Handle — 45×4, 9px from top */}
            <div className="mx-auto mt-2.25 w-11.25 h-1 rounded-xs bg-[#D6DCE2]" />

            {/* Close — 28px circle #DDE7E1, center (334,199) → 25px from sheet top */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 size-11 rounded-full bg-[#E8ECEF] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4.5 h-4.5 text-[#1F140A]" strokeWidth={2.2} />
            </button>

            <div className="px-4.5 pb-6.75">
              {/* Title — baseline y=215 (41px from sheet top) */}
              <h2 className="mt-5.25 text-[17px] font-extrabold leading-5.5 text-[#1F140A]">
                Add Food Item
              </h2>
              {/* Subtitle — baseline y=231 */}
              <p className="mt-px text-[11px] font-semibold leading-3.5 text-[#7A6658]">
                Manage live canteen inventory
              </p>

              {/* Title field — label baseline y=254, input y=265 h=43 rx=21 */}
              <label
                htmlFor="aef-title"
                className="block mt-4 text-[13px] font-bold leading-4.25 text-[#1F140A]"
              >
                Title
              </label>
              <input
                id="aef-title"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Add food item"
                className="mt-1.25 w-full h-10.75 rounded-[21px] bg-[#E8ECEF] border border-[#D6DCE2] px-3.5 text-[12px] font-medium text-[#1F140A] placeholder:text-[#6B8075] focus:outline-none"
                style={{ boxShadow: 'inset 3px 3px 6px rgba(154,166,179,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)' }}
              />

              {/* Category — Single segmented control */}
              <span className="block mt-6 text-[13px] font-bold leading-4.25 text-[#1F140A]">
                Category
              </span>
              <div
                className="mt-1.5 w-full h-11 rounded-[22px] bg-[#E8ECEF] border border-[#D6DCE2] p-0.75 flex"
                style={{ boxShadow: 'inset 3px 3px 6px rgba(154,166,179,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)' }}
              >
                {(['cooked', 'packed'] as const).map((cat) => {
                  const selected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      aria-pressed={selected}
                      className={`flex-1 h-full rounded-[18px] text-[12px] font-extrabold capitalize transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selected
                          ? 'bg-[#FE7200] text-white shadow-sm'
                          : 'text-[#1F140A]/70 hover:text-[#1F140A]'
                      }`}
                    >
                      <span>{cat === 'cooked' ? '🍳 Cooked Food' : '📦 Packed Food'}</span>
                    </button>
                  );
                })}
              </div>

              {/* Service Mode — Walk-In or Order Toggle */}
              <div className="mt-5">
                <div className="flex flex-wrap gap-1 items-center justify-between">
                  <span className="block text-[13px] font-bold leading-4.25 text-[#1F140A]">
                    Service Mode
                  </span>
                  <span className={`text-[10px] font-extrabold ${actionType === 'walkin' ? 'text-emerald-700' : 'text-[#FE7200]'}`}>
                    {actionType === 'order' ? '🛒 Students send an order to your cafe' : '📍 Students walk in with the live map'}
                  </span>
                </div>
                <div
                  className="mt-1.5 w-full h-11 rounded-[22px] bg-[#E8ECEF] border border-[#D6DCE2] p-0.75 flex gap-1"
                  style={{ boxShadow: 'inset 3px 3px 6px rgba(154,166,179,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)' }}
                >
                  <button
                    type="button"
                    onClick={() => setActionType('walkin')}
                    aria-pressed={actionType === 'walkin'}
                    className={`flex-1 h-full rounded-[18px] text-[12px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      actionType === 'walkin'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md btn-green-shadow'
                        : 'text-[#1F140A]/70 hover:text-emerald-800'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Walk-In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType('order')}
                    aria-pressed={actionType === 'order'}
                    className={`flex-1 h-full rounded-[18px] text-[12px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      actionType === 'order'
                        ? 'bg-gradient-to-r from-[#FF8A2A] to-[#FE7200] text-white shadow-md btn-orange-shadow'
                        : 'text-[#1F140A]/70 hover:text-[#FE7200]'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Order In</span>
                  </button>
                </div>
              </div>

              {/* Price — with Stepper */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="aef-price"
                    className="block text-[13px] font-bold leading-4.25 text-[#1F140A]"
                  >
                    Price
                  </label>
                  <span className="text-[10px] font-bold text-[#FE7200]">
                    ₹0 – ₹200 Quick Step
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Stepper
                    min={0}
                    max={200}
                    value={price ? Number(price) : 50}
                    onChange={(val) => setPrice(String(val))}
                    prefix="₹"
                    size="md"
                    className="flex-1"
                  />
                  <div
                    className="w-24 h-10 rounded-2xl bg-[#E8ECEF] border border-[#D6DCE2] flex items-center px-2.5"
                    style={{ boxShadow: 'inset 2px 2px 4px rgba(154,166,179,0.4), inset -2px -2px 4px rgba(255,255,255,0.8)' }}
                  >
                    <span className="text-[11px] font-bold text-[#7A6658] mr-1">₹</span>
                    <input
                      id="aef-price"
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Custom"
                      className="w-full bg-transparent text-[12px] font-bold text-[#1F140A] placeholder:text-[#7A6658]/60 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Vegetarian Only — label y=508, sub y=523; switch 50×28 knob right */}
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <span className="block text-[13px] font-bold leading-4.25 text-[#1F140A]">
                    Vegetarian Only
                  </span>
                  <span className="block mt-px text-[10px] font-medium leading-3.25 text-[#7A6658]">
                    Pure veg preparation
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={vegetarian}
                  aria-label="Vegetarian only"
                  onClick={() => setVegetarian(v => !v)}
                  className="relative w-12.5 h-7 rounded-[14px] cursor-pointer transition-colors shrink-0"
                  style={{
                    background: vegetarian ? '#FE7200' : '#C9D0D8',
                    boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)'
                  }}
                >
                  <span
                    className="absolute top-0.75 w-5.5 h-5.5 rounded-full bg-white transition-all"
                    style={{ left: vegetarian ? 25 : 3 }}
                  />
                </button>
              </div>

              {/* Upload — 317×143 rx=20 dashed #9BAFA3 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 w-full h-35.75 rounded-[20px] border-[1.5px] border-dashed border-[#C2C9D1] bg-[#E8ECEF] flex flex-col items-center justify-center cursor-pointer hover:bg-[#D3DFDA] transition-colors overflow-hidden"
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Selected food"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Upload className="w-7.5 h-7.5 text-[#789184]" strokeWidth={1.9} />
                    <span className="mt-3 text-[14px] font-semibold text-[#7A6658]">
                      Upload Photo
                    </span>
                    <span className="mt-1 text-[10px] font-medium text-[#71867A]">
                      JPG or PNG
                    </span>
                  </>
                )}
              </button>

              {error && (
                <div role="alert" className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-red-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* CTA — 317×47 rx=12 #FE7200 (y=710 → 27px from sheet bottom) */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-7 w-full h-11.75 rounded-xl bg-[#FE7200] text-white text-[14px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#E05D00] active:scale-[0.98] transition-all"
                style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
              >
                {submitting ? 'Publishing…' : 'Publish to YEMEMUNNAI'}
              </button>
            </div>
            </fieldset>
          </form>
        )}
      </div>
    </div>
  );
};
