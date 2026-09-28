import React, { useRef, useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { createFoodItem, uploadFoodPhoto } from '../lib/api';
import { useModalA11y } from '../lib/useModalA11y';
import { isBackendConfigured } from '../lib/supabase';
import { useVendorSession } from '../lib/hooks';
import type { FoodCategory } from '../lib/types';

interface AddEditFoodItemScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onPublished?: (item: { name: string; price: number }) => void;
}

/**
 * Screen 05 — "Add & Edit Food Item" bottom sheet, 1:1 from
 * figma_svgs/05_add_edit_food_item.svg (375 × 812):
 *   - Sheet ........ x=13 y=174 w=349 h=611 rx=27 #E5EDE9, white stroke .85, soft shadow
 *   - Handle ....... 45×4 rx=2 #BAC8C0 (y=183)
 *   - Title ........ "Add & Edit Food Item" 17px w800 (baseline y=215)
 *   - Subtitle ..... "Manage live canteen inventory" 11px w600 #5C7A6D (y=231)
 *   - Close ........ 28px circle #DDE7E1 at (334,199), X 18px #0A2E20 sw 2.2
 *   - Title input .. label 13px w700 (y=254); input x=29 y=265 w=317 h=43 rx=21 inset,
 *                    placeholder "Add food item" 12px w500 #6B8075
 *   - Category ..... label 13px w700 (y=336); two 154×43 rx=20 inset selects at x=29/x=192,
 *                    text 13px w600 at x+14, chevron 18px #09431B at right
 *   - Price ........ label 13px w700 (y=423); input 317×43 rx=21 inset, "₹ Enter price"
 *   - Veg toggle ... "Vegetarian Only" 13px w700 (y=508) + "Pure veg preparation" 10px w500;
 *                    switch 50×28 rx=14 #09431B, knob d=22 at RIGHT (cx=332)
 *   - Upload ....... x=29 y=539 w=317 h=143 rx=20 dashed #9BAFA3, arrow-up icon 30px
 *                    #789184, "Upload Photo" 14px w600 #5C7A6D, "JPG or PNG" 10px #71867A
 *   - CTA .......... x=29 y=710 w=317 h=47 rx=12 #09431B "Publish to YEMEMUNNAI" 14px w700
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
  const [price, setPrice] = useState('');
  const [vegetarian, setVegetarian] = useState(true);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sheetRef = useModalA11y<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
    setError(null);

    if (!vendor) {
      setError('Sign in as a vendor first.');
      return;
    }
    const priceNum = Math.max(0, Math.round(Number(price)));
    if (!name.trim() || !Number.isFinite(priceNum)) {
      setError('Please enter a valid name and price.');
      return;
    }

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

      // 2. Insert the item (live mode only)
      if (isBackendConfigured) {
        const created = await createFoodItem(vendor.vendorId, {
          name: name.trim(),
          price: priceNum,
          category,
          actionType: category === 'cooked' ? 'walkin' : 'order',
          inStock: true,
          imageUrl
        });
        if (!created) {
          setError('Could not publish the item. Try again.');
          setSubmitting(false);
          return;
        }
      }

      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onPublished?.({ name: name.trim(), price: priceNum });
        onClose();
        // reset form
        setName('');
        setPrice('');
        setPhoto(null);
        setPhotoPreview(null);
        setUploadedUrl(null);
      }, 1200);
    } catch {
      setSubmitting(false);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div
      className="absolute inset-0 z-50"
      style={{ background: 'rgba(3, 42, 21, 0.43)' }}
      onClick={onClose}
    >
      {/* Sheet x=13 y=174 w=349 h=611 rx=27 */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Add or edit food item"
        className="absolute left-[13px] right-[13px] top-[174px] bottom-[27px] rounded-[27px] bg-[#E8ECEF] border border-white/60 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-bottom-6 duration-200"
        style={{ boxShadow: '-6px -6px 12px rgba(255,255,255,0.85), 6px 6px 12px rgba(163,174,187,0.45)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="h-full min-h-[560px] flex flex-col items-center justify-center text-center px-[18px]">
            <CheckCircle className="w-14 h-14 text-[#09431B]" />
            <h3 className="text-[17px] font-extrabold text-[#0A2E20] mt-3">Item Published!</h3>
            <p className="text-[11px] font-semibold text-[#5C7A6D] mt-1">
              {name} is now live on YEMEMUNNAI.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Handle — 45×4, 9px from top */}
            <div className="mx-auto mt-[9px] w-[45px] h-[4px] rounded-[2px] bg-[#BAC8C0]" />

            {/* Close — 28px circle #DDE7E1, center (334,199) → 25px from sheet top */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute left-[307px] top-[11px] w-[28px] h-[28px] rounded-full bg-[#E8ECEF] flex items-center justify-center cursor-pointer"
            >
              <X className="w-[18px] h-[18px] text-[#0A2E20]" strokeWidth={2.2} />
            </button>

            <div className="px-[18px] pb-[27px]">
              {/* Title — baseline y=215 (41px from sheet top) */}
              <h2 className="mt-[21px] text-[17px] font-extrabold leading-[22px] text-[#0A2E20]">
                Add &amp; Edit Food Item
              </h2>
              {/* Subtitle — baseline y=231 */}
              <p className="mt-[1px] text-[11px] font-semibold leading-[14px] text-[#5C7A6D]">
                Manage live canteen inventory
              </p>

              {/* Title field — label baseline y=254, input y=265 h=43 rx=21 */}
              <label
                htmlFor="aef-title"
                className="block mt-[16px] text-[13px] font-bold leading-[17px] text-[#0A2E20]"
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
                className="mt-[5px] w-full h-[43px] rounded-[21px] bg-[#E8ECEF] border border-[#D6DCE2] px-[14px] text-[12px] font-medium text-[#0A2E20] placeholder:text-[#6B8075] focus:outline-none"
                style={{ boxShadow: 'inset 3px 3px 6px rgba(154,166,179,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)' }}
              />

              {/* Category — label baseline y=336, two 154×43 rx=20 selects */}
              <span className="block mt-[24px] text-[13px] font-bold leading-[17px] text-[#0A2E20]">
                Category
              </span>
              <div className="mt-[6px] flex gap-[9px]">
                {(['cooked', 'packed'] as const).map((cat) => {
                  const selected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      aria-pressed={selected}
                      className="relative w-[154px] h-[43px] rounded-[20px] bg-[#E8ECEF] border border-[#D6DCE2] text-left pl-[14px] pr-[26px] cursor-pointer focus:outline-none"
                      style={{
                        boxShadow: 'inset 3px 3px 6px rgba(154,166,179,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)',
                        borderColor: selected ? '#09431B' : '#D6DCE2'
                      }}
                    >
                      <span
                        className={`text-[13px] font-semibold capitalize ${
                          selected ? 'text-[#0A2E20]' : 'text-[#0A2E20]/70'
                        }`}
                      >
                        {cat}
                      </span>
                      <ChevronDown
                        className="absolute right-[9px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#09431B]"
                        strokeWidth={1.9}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Price — label baseline y=423, input 317×43 rx=21 */}
              <label
                htmlFor="aef-price"
                className="block mt-[24px] text-[13px] font-bold leading-[17px] text-[#0A2E20]"
              >
                Price
              </label>
              <div
                className="mt-[5px] w-full h-[43px] rounded-[21px] bg-[#E8ECEF] border border-[#D6DCE2] flex items-center px-[14px]"
                style={{ boxShadow: 'inset 3px 3px 6px rgba(154,166,179,0.5), inset -3px -3px 6px rgba(255,255,255,0.85)' }}
              >
                <span className="text-[12px] font-medium text-[#6B8075] mr-[6px]">₹</span>
                <input
                  id="aef-price"
                  type="number"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price"
                  className="flex-1 bg-transparent text-[12px] font-medium text-[#0A2E20] placeholder:text-[#6B8075] focus:outline-none"
                />
              </div>

              {/* Vegetarian Only — label y=508, sub y=523; switch 50×28 knob right */}
              <div className="mt-[24px] flex items-center justify-between">
                <div>
                  <span className="block text-[13px] font-bold leading-[17px] text-[#0A2E20]">
                    Vegetarian Only
                  </span>
                  <span className="block mt-[1px] text-[10px] font-medium leading-[13px] text-[#5C7A6D]">
                    Pure veg preparation
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={vegetarian}
                  aria-label="Vegetarian only"
                  onClick={() => setVegetarian(v => !v)}
                  className="relative w-[50px] h-[28px] rounded-[14px] cursor-pointer transition-colors shrink-0"
                  style={{
                    background: vegetarian ? '#09431B' : '#C9D0D8',
                    boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)'
                  }}
                >
                  <span
                    className="absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white transition-all"
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
                className="mt-[16px] w-full h-[143px] rounded-[20px] border-[1.5px] border-dashed border-[#C2C9D1] bg-[#E8ECEF] flex flex-col items-center justify-center cursor-pointer hover:bg-[#D3DFDA] transition-colors overflow-hidden"
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Selected food"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Upload className="w-[30px] h-[30px] text-[#789184]" strokeWidth={1.9} />
                    <span className="mt-[12px] text-[14px] font-semibold text-[#5C7A6D]">
                      Upload Photo
                    </span>
                    <span className="mt-[4px] text-[10px] font-medium text-[#71867A]">
                      JPG or PNG
                    </span>
                  </>
                )}
              </button>

              {error && (
                <div role="alert" className="mt-[10px] flex items-center gap-1.5 text-[10px] font-bold text-red-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {!isBackendConfigured && (
                <p className="mt-[8px] text-[9px] text-amber-700 font-bold">
                  Demo mode — add Supabase keys to publish for real.
                </p>
              )}

              {/* CTA — 317×47 rx=12 #09431B (y=710 → 27px from sheet bottom) */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-[28px] w-full h-[47px] rounded-[12px] bg-[#09431B] text-white text-[14px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#073515] active:scale-[0.98] transition-all"
                style={{ boxShadow: '-3px -3px 7px rgba(255,255,255,0.8), 4px 4px 8px rgba(163,174,187,0.4)' }}
              >
                {submitting ? 'Publishing…' : 'Publish to YEMEMUNNAI'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
