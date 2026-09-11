'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettingsBatch } from '@/actions/settings';
import { useTranslations } from 'next-intl';

const DEFAULT_PATHS = ['/admin/', '/account/', '/checkout/', '/api/'];

export default function RobotsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const router = useRouter();
  const t = useTranslations('AdminRobots');

  // Parse initial disallow paths
  const initialPaths: string[] = (() => {
    if (initialSettings.ROBOTS_DISALLOW_PATHS) {
      try {
        return JSON.parse(initialSettings.ROBOTS_DISALLOW_PATHS);
      } catch {
        return DEFAULT_PATHS;
      }
    }
    return DEFAULT_PATHS;
  })();

  const [paths, setPaths] = useState<string[]>(initialPaths);
  const [newPath, setNewPath] = useState('');
  const [crawlDelay, setCrawlDelay] = useState(initialSettings.ROBOTS_CRAWL_DELAY || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const siteUrl = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://mystore.com')
    : 'https://mystore.com';

  // Generate the robots.txt preview
  const robotsPreview = useMemo(() => {
    let preview = 'User-Agent: *\n';
    preview += 'Allow: /\n';
    paths.forEach((p) => {
      preview += `Disallow: ${p}\n`;
    });
    if (crawlDelay && !isNaN(parseInt(crawlDelay, 10)) && parseInt(crawlDelay, 10) > 0) {
      preview += `Crawl-delay: ${crawlDelay}\n`;
    }
    preview += `\nSitemap: ${siteUrl}/sitemap.xml`;
    return preview;
  }, [paths, crawlDelay, siteUrl]);

  const addPath = () => {
    let formatted = newPath.trim();
    if (!formatted) return;

    // Auto-format: ensure starts with /
    if (!formatted.startsWith('/')) {
      formatted = '/' + formatted;
    }
    // Auto-format: ensure ends with /
    if (!formatted.endsWith('/')) {
      formatted = formatted + '/';
    }

    if (paths.includes(formatted)) {
      setError(t('path_exists') || 'Ce chemin existe déjà.');
      return;
    }

    setPaths([...paths, formatted]);
    setNewPath('');
    setError('');
  };

  const removePath = (pathToRemove: string) => {
    if (DEFAULT_PATHS.includes(pathToRemove)) return; // Protected paths
    setPaths(paths.filter((p) => p !== pathToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPath();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    const settingsMap: Record<string, string> = {
      ROBOTS_DISALLOW_PATHS: JSON.stringify(paths),
    };

    if (crawlDelay) {
      settingsMap.ROBOTS_CRAWL_DELAY = crawlDelay;
    }

    const result = await updateSettingsBatch(settingsMap);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage(t('save_success') || 'Robots.txt mis à jour avec succès');
    }

    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('title') || 'Robots.txt'}</h2>
        <p className="text-gray-500 mt-1">
          {t('description') || 'Gérez les règles d\'indexation de votre site par les moteurs de recherche.'}
        </p>
      </div>

      {/* Success / Error messages */}
      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Disallow Paths */}
        <div className="border-b border-gray-100 pb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('disallow_paths_label') || 'Chemins bloqués (Disallow)'}
            </label>
            <p className="text-xs text-gray-500">
              {t('disallow_paths_help') || 'Les chemins ci-dessous seront interdits aux moteurs de recherche. Les chemins par défaut (protégés) ne peuvent pas être supprimés.'}
            </p>
          </div>

          {/* Current paths list */}
          <div className="space-y-2 mb-4">
            {paths.map((path) => {
              const isDefault = DEFAULT_PATHS.includes(path);
              return (
                <div
                  key={path}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-md border ${
                    isDefault
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <code className="text-sm font-mono text-gray-800">{path}</code>
                    {isDefault && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        {t('default_badge') || 'Défaut'}
                      </span>
                    )}
                  </div>
                  {!isDefault && (
                    <button
                      type="button"
                      onClick={() => removePath(path)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                      title={t('remove_path') || 'Supprimer'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add new path */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm font-mono">/</span>
              <input
                type="text"
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('add_path_placeholder') || 'staging/'}
                className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
              />
            </div>
            <button
              type="button"
              onClick={addPath}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{t('add_btn') || 'Ajouter'}</span>
            </button>
          </div>
        </div>

        {/* Crawl Delay */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-6">
          <div className="mb-4 md:mb-0 md:w-1/3">
            <label className="block text-sm font-medium text-gray-700">
              {t('crawl_delay_label') || 'Crawl Delay (secondes)'}
            </label>
            <p className="text-xs text-gray-500 mt-1">
              {t('crawl_delay_help') || 'Délai minimum entre les requêtes du robot. Laissez vide pour aucune restriction.'}
            </p>
          </div>
          <div className="md:w-2/3">
            <input
              type="number"
              min="0"
              max="120"
              value={crawlDelay}
              onChange={(e) => setCrawlDelay(e.target.value)}
              placeholder="10"
              className="w-full max-w-[120px] px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Live Preview */}
        <div className="pb-2">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              {t('preview_label') || 'Aperçu du robots.txt'}
            </label>
            <p className="text-xs text-gray-500 mt-1">
              {t('preview_help') || 'Voici le fichier robots.txt tel qu\'il sera servi aux moteurs de recherche.'}
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-xs text-gray-500 font-mono">/robots.txt</span>
            </div>
            <pre className="text-green-400 text-sm font-mono whitespace-pre leading-relaxed">
              {robotsPreview}
            </pre>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 text-sm font-semibold transition-colors"
        >
          {isLoading ? (t('saving') || 'Sauvegarde...') : (t('save_btn') || 'Enregistrer les modifications')}
        </button>
      </div>
    </form>
  );
}
