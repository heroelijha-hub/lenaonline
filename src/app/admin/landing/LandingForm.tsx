'use client';

import { useState } from 'react';
import { updateSetting } from '@/actions/settings';
import { uploadImage } from '@/actions/admin';

export default function LandingForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Keep track of new files selected for each key
  const [imageFiles, setImageFiles] = useState<Record<string, File>>({});

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (key: string, file: File | null) => {
    if (file) {
      setImageFiles(prev => ({ ...prev, [key]: file }));
    } else {
      const newFiles = { ...imageFiles };
      delete newFiles[key];
      setImageFiles(newFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const finalSettings = { ...settings };

      // 1. Upload new images if selected
      for (const [key, file] of Object.entries(imageFiles)) {
        const formData = new FormData();
        formData.append('file', file);
        const url = await uploadImage(formData);
        if (url) {
          finalSettings[key] = url; // Update setting with new URL
        }
      }

      // 2. Save all settings to DB
      for (const [key, value] of Object.entries(finalSettings)) {
        await updateSetting(key, value);
      }
      
      // Update local state to reflect new URLs
      setSettings(finalSettings);
      setImageFiles({}); // Clear pending uploads
      
      setMessage('Modifications enregistrées avec succès !');
    } catch (error) {
      setMessage('Erreur lors de la sauvegarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (label: string, key: string, placeholder: string) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={settings[key] || ''}
        onChange={(e) => handleChange(key, e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
      />
    </div>
  );

  const renderImageUpload = (label: string, key: string, sizeHint: string) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} <span className="text-xs text-gray-500 font-normal">({sizeHint})</span></label>
      
      {/* Aperçu de l'image actuelle si elle existe et qu'aucun nouveau fichier n'est sélectionné */}
      {settings[key] && !imageFiles[key] && (
        <div className="mb-2 relative w-24 h-24 border rounded overflow-hidden bg-gray-50">
           <img src={settings[key]} alt="Aperçu" className="w-full h-full object-contain" />
           <button 
             type="button" 
             onClick={() => handleChange(key, '')} 
             className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
           >
             &times;
           </button>
        </div>
      )}

      {/* Upload input */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
        className="w-full px-3 py-1.5 border border-gray-300 rounded-md file:mr-4 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 text-sm"
      />
      {imageFiles[key] && <p className="text-xs text-green-600 mt-1">Nouveau fichier prêt à être uploadé : {imageFiles[key].name}</p>}
      {!settings[key] && !imageFiles[key] && <p className="text-xs text-gray-400 mt-1">Aucune image. Dessin par défaut affiché.</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {message && (
        <div className={`p-4 rounded-md ${message.includes('succès') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Hero Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Section Principale (Hero)</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bloc Principal Gauche */}
          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-semibold mb-3 text-orange-600">Bloc Principal (Gauche)</h3>
            {renderInput('Titre (ex: Apple Iphone 17 Pro Max)', 'HERO_1_TITLE', 'Titre principal')}
            {renderInput('Sous-titre (ex: Super Discount)', 'HERO_1_SUBTITLE', 'Sous-titre')}
            {renderInput('Prix (ex: from $349.99)', 'HERO_1_PRICE', 'Texte de prix')}
            {renderInput('Texte du bouton', 'HERO_1_CTA', 'Shop Now')}
            {renderInput('Lien du bouton', 'HERO_1_LINK', '/product/...')}
            {renderImageUpload('Image du Produit', 'HERO_1_IMAGE', 'Taille rec. ~ 400x500px, PNG sans fond')}
          </div>

          <div className="space-y-6">
            {/* Bloc Haut Milieu */}
            <div className="bg-gray-50 p-4 rounded border">
              <h3 className="font-semibold mb-3 text-orange-600">Bloc Haut (Montres)</h3>
              {renderInput('Titre (ex: Heavy On Features...)', 'HERO_2_TITLE', 'Titre principal')}
              {renderInput('Sous-titre (ex: Use Code: SALE35%)', 'HERO_2_SUBTITLE', 'Sous-titre')}
              {renderInput('Lien', 'HERO_2_LINK', '/category/...')}
              {renderImageUpload('Image du Produit', 'HERO_2_IMAGE', 'Taille rec. ~ 200x200px, PNG sans fond')}
            </div>

            {/* Bloc Haut Droite */}
            <div className="bg-gray-50 p-4 rounded border">
              <h3 className="font-semibold mb-3 text-orange-600">Bloc Haut (Enceinte)</h3>
              {renderInput('Titre (ex: Sale 10% Off Speaker)', 'HERO_3_TITLE', 'Titre principal')}
              {renderInput('Sous-titre (ex: New Product)', 'HERO_3_SUBTITLE', 'Sous-titre')}
              {renderInput('Lien', 'HERO_3_LINK', '/category/...')}
              {renderImageUpload('Image du Produit', 'HERO_3_IMAGE', 'Taille rec. ~ 200x200px, PNG sans fond')}
            </div>
            
            {/* Bloc Bas */}
            <div className="bg-gray-50 p-4 rounded border">
              <h3 className="font-semibold mb-3 text-orange-600">Bloc Bas (Casque)</h3>
              {renderInput('Titre (ex: Headphones Listen...)', 'HERO_4_TITLE', 'Titre principal')}
              {renderInput('Sous-titre (ex: Last call for up to 25% off)', 'HERO_4_SUBTITLE', 'Sous-titre')}
              {renderInput('Lien', 'HERO_4_LINK', '/category/...')}
              {renderImageUpload('Image du Produit', 'HERO_4_IMAGE', 'Taille rec. ~ 300x300px, PNG sans fond')}
            </div>
          </div>
        </div>
      </div>

      {/* Best Deals Promo Banners */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">Bannières Promotionnelles (Bas)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-semibold mb-3 text-orange-600">Bannière Gauche (Montre)</h3>
            {renderInput('Titre', 'PROMO_1_TITLE', 'NOTHING WATCH PRO 2')}
            {renderInput('Sous-titre', 'PROMO_1_SUBTITLE', 'Price Start $69')}
            {renderInput('Lien', 'PROMO_1_LINK', '/product/...')}
            {renderImageUpload('Image du Produit', 'PROMO_1_IMAGE', 'Taille rec. ~ 250x250px')}
          </div>
          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-semibold mb-3 text-orange-600">Bannière Droite (Women Store)</h3>
            {renderInput('Titre', 'PROMO_2_TITLE', 'Get 20% Off')}
            {renderInput('Sous-titre', 'PROMO_2_SUBTITLE', 'Women Store')}
            {renderInput('Lien', 'PROMO_2_LINK', '/category/women')}
            {renderImageUpload('Image du Produit', 'PROMO_2_IMAGE', 'Taille rec. ~ 250x250px')}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-8 py-3 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
        >
          {isLoading ? 'Upload et Enregistrement en cours...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </form>
  );
}
