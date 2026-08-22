import Link from 'next/link';
import prisma from '@/lib/prisma';
import HeroMobileSliderWrapper from './HeroMobileSliderWrapper';

export default async function Hero({ config }: { config?: any }) {
  const settingsDb = await prisma.setting.findMany();
  let settings = settingsDb.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
  
  if (config) {
    settings = { ...settings, ...config };
  }

  const getResponsiveVars = (baseKey: string, defaultSizes: { m: string, t: string, d: string }) => {
    return {
      '--sz-m': settings[`${baseKey}_SIZE_MOBILE`] || defaultSizes.m,
      '--sz-t': settings[`${baseKey}_SIZE_TABLET`] || defaultSizes.t,
      '--sz-d': settings[`${baseKey}_SIZE_DESKTOP`] || defaultSizes.d,
    } as React.CSSProperties;
  };

  const block1 = (
    <div 
      className="rounded-xl overflow-hidden relative p-6 sm:p-8 flex-col items-center text-center h-full min-h-[400px] lg:min-h-0 border border-gray-100 group flex w-full"
      style={{
        backgroundColor: settings.HERO_1_BG_COLOR || '#FFF5EE',
        backgroundImage: settings.HERO_1_BG_IMAGE ? `url(${settings.HERO_1_BG_IMAGE})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="z-10 relative mt-4">
        <span 
          className="text-red-500 font-bold tracking-wider uppercase mb-3 block text-[var(--sz-m)] md:text-[var(--sz-t)] lg:text-[var(--sz-d)]"
          style={getResponsiveVars('HERO_1_SUBTITLE', {m: '12px', t: '14px', d: '14px'})}
        >
          {settings.HERO_1_SUBTITLE || 'Supper Discount'}
        </span>
        <h2 
          className="font-bold text-slate-800 mb-2 text-[var(--sz-m)] md:text-[var(--sz-t)] lg:text-[var(--sz-d)]" 
          style={{...getResponsiveVars('HERO_1_TITLE', {m: '28px', t: '32px', d: '36px'}), color: settings.HERO_1_TEXT_COLOR || undefined}}
        >
          {settings.HERO_1_TITLE || 'Apple Iphone 17 Pro Max'}
        </h2>
        <p 
          className="text-gray-600 mb-6 text-[var(--sz-m)] md:text-[var(--sz-t)] lg:text-[var(--sz-d)]" 
          style={{...getResponsiveVars('HERO_1_PRICE', {m: '16px', t: '18px', d: '18px'}), color: settings.HERO_1_TEXT_COLOR || undefined}}
        >
          {settings.HERO_1_PRICE || 'from $349.99'}
        </p>
        <Link 
          href={settings.HERO_1_LINK || '/#'} 
          className="inline-block bg-orange-500 hover:bg-orange-600 text-gray-900 font-semibold px-8 py-2.5 rounded shadow-sm transition-transform transform hover:scale-105"
          style={{
            backgroundColor: settings.HERO_1_BTN_BG_COLOR || undefined,
            color: settings.HERO_1_BTN_TEXT_COLOR || undefined
          }}
        >
          {settings.HERO_1_CTA || 'Shop Now'}
        </Link>
      </div>
      {settings.HERO_1_IMAGE ? (
        <img src={settings.HERO_1_IMAGE} alt="Hero 1" className="absolute bottom-0 w-4/5 object-contain max-h-[60%] group-hover:scale-105 transition-transform duration-500 z-0" />
      ) : (
        <div className="absolute bottom-[-10%] w-full h-[60%] bg-orange-400 rounded-t-3xl mt-auto translate-y-10 group-hover:translate-y-4 transition-transform duration-500">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4/5 h-full bg-orange-500 rounded-3xl shadow-xl border-4 border-orange-300">
              <div className="absolute top-6 left-6 w-16 h-16 bg-orange-700/40 rounded-2xl flex flex-wrap p-2 gap-1">
                 <div className="w-5 h-5 bg-black rounded-full"></div>
                 <div className="w-5 h-5 bg-black rounded-full"></div>
                 <div className="w-5 h-5 bg-black rounded-full"></div>
              </div>
          </div>
        </div>
      )}
    </div>
  );

  const block2 = (
    <div 
      className="rounded-xl overflow-hidden relative p-6 sm:p-8 flex-col justify-center border border-gray-100 group h-full min-h-[300px] lg:min-h-0 flex w-full"
      style={{
        backgroundColor: settings.HERO_2_BG_COLOR || '#F8F9FA',
        backgroundImage: settings.HERO_2_BG_IMAGE ? `url(${settings.HERO_2_BG_IMAGE})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="z-20 w-[65%] sm:w-2/3">
        <span 
          className="text-gray-500 font-semibold mb-2 block uppercase tracking-wide text-[var(--sz-m)] md:text-[var(--sz-t)] lg:text-[var(--sz-d)]"
          style={getResponsiveVars('HERO_2_SUBTITLE', {m: '12px', t: '14px', d: '14px'})}
        >
          {settings.HERO_2_SUBTITLE || 'Use Code: SALE35%'}
        </span>
        <h2 
          className="font-bold text-slate-800 mb-6 leading-tight whitespace-pre-line text-[var(--sz-m)] md:text-[var(--sz-t)] lg:text-[var(--sz-d)]" 
          style={{...getResponsiveVars('HERO_2_TITLE', {m: '20px', t: '24px', d: '28px'}), color: settings.HERO_2_TEXT_COLOR || undefined}}
        >
          {settings.HERO_2_TITLE || 'Heavy On Features\nLight On Price'}
        </h2>
        <Link 
          href={settings.HERO_2_LINK || '/#'} 
          className="inline-block bg-orange-500 hover:bg-orange-600 text-gray-900 font-semibold px-6 py-2 rounded shadow-sm transition-transform transform hover:scale-105"
          style={{
            backgroundColor: settings.HERO_2_BTN_BG_COLOR || undefined,
            color: settings.HERO_2_BTN_TEXT_COLOR || undefined
          }}
        >
          Shop Now
        </Link>
      </div>
      {settings.HERO_2_IMAGE ? (
        <img src={settings.HERO_2_IMAGE} alt="Hero 2" className="absolute -right-4 top-1/2 -translate-y-1/2 w-[45%] md:w-1/2 object-contain group-hover:scale-105 transition-transform duration-500 z-10" />
      ) : (
        <div className="absolute -right-12 sm:-right-8 top-1/2 -translate-y-1/2 w-40 h-40 sm:w-48 sm:h-48 rounded-full border-8 border-gray-200 bg-white shadow-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 z-10">
           <div className="text-center font-bold text-2xl sm:text-3xl">12<br/>9 3<br/>6</div>
        </div>
      )}
    </div>
  );

  const block3 = (
    <div 
      className="rounded-xl overflow-hidden relative p-6 sm:p-8 flex-col justify-center border border-gray-100 group h-full min-h-[300px] lg:min-h-0 flex w-full"
      style={{
        backgroundColor: settings.HERO_3_BG_COLOR || '#F8F9FA',
        backgroundImage: settings.HERO_3_BG_IMAGE ? `url(${settings.HERO_3_BG_IMAGE})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="z-20 w-[65%] sm:w-2/3">
        <span 
          className="text-red-500 font-bold tracking-wider uppercase mb-2 block text-[var(--sz-m)] md:text-[var(--sz-t)] lg:text-[var(--sz-d)]"
          style={getResponsiveVars('HERO_3_SUBTITLE', {m: '12px', t: '14px', d: '14px'})}
        >
          {settings.HERO_3_SUBTITLE || 'New Product'}
        </span>
        <h2 
          className="font-bold text-slate-800 mb-2 leading-tight whitespace-pre-line text-[var(--sz-m)] md:text-[var(--sz-t)] lg:text-[var(--sz-d)]" 
          style={{...getResponsiveVars('HERO_3_TITLE', {m: '20px', t: '24px', d: '28px'}), color: settings.HERO_3_TEXT_COLOR || undefined}}
        >
          {settings.HERO_3_TITLE || 'Sale 10%\nOff Speaker'}
        </h2>
        <Link 
          href={settings.HERO_3_LINK || '/#'} 
          className="inline-block bg-orange-500 hover:bg-orange-600 text-gray-900 font-semibold px-6 py-2 mt-4 rounded shadow-sm transition-transform transform hover:scale-105"
          style={{
            backgroundColor: settings.HERO_3_BTN_BG_COLOR || undefined,
            color: settings.HERO_3_BTN_TEXT_COLOR || undefined
          }}
        >
          Shop Now
        </Link>
      </div>
      {settings.HERO_3_IMAGE ? (
        <img src={settings.HERO_3_IMAGE} alt="Hero 3" className="absolute right-0 top-1/2 -translate-y-1/2 w-[45%] md:w-1/2 object-contain group-hover:scale-105 transition-transform duration-500 z-10" />
      ) : (
        <div className="absolute -right-4 sm:right-0 top-1/2 -translate-y-1/2 w-32 h-32 sm:w-40 sm:h-40 bg-zinc-800 rounded-3xl sm:translate-x-4 shadow-2xl flex items-center justify-center group-hover:-translate-x-2 transition-transform duration-500 z-10">
           <span className="text-zinc-600 font-bold text-xl sm:text-2xl -rotate-90">XBOOM</span>
        </div>
      )}
    </div>
  );

  const block4 = (
    <div 
      className="rounded-xl overflow-hidden relative p-6 sm:p-8 flex-col justify-center h-full min-h-[300px] lg:min-h-0 border border-gray-100 group flex w-full"
      style={{
        backgroundColor: settings.HERO_4_BG_COLOR || '#FFF5EE',
        backgroundImage: settings.HERO_4_BG_IMAGE ? `url(${settings.HERO_4_BG_IMAGE})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="z-20 w-[60%] md:w-1/2 lg:pl-4">
        <h2 
          className="font-bold text-slate-800 mb-3 leading-tight whitespace-pre-line text-[var(--sz-m)] md:text-[var(--sz-t)] lg:text-[var(--sz-d)]" 
          style={{...getResponsiveVars('HERO_4_TITLE', {m: '22px', t: '26px', d: '30px'}), color: settings.HERO_4_TEXT_COLOR || undefined}}
        >
          {settings.HERO_4_TITLE || 'Headphones Listen With\nHeart'}
        </h2>
        <p 
          className="text-slate-600 mb-6 font-medium text-[var(--sz-m)] md:text-[var(--sz-t)] lg:text-[var(--sz-d)]" 
          style={{...getResponsiveVars('HERO_4_SUBTITLE', {m: '14px', t: '16px', d: '16px'}), color: settings.HERO_4_TEXT_COLOR || undefined}}
        >
          {settings.HERO_4_SUBTITLE || 'Last call for up to 25% off'}
        </p>
        <Link 
          href={settings.HERO_4_LINK || '/#'} 
          className="inline-block bg-orange-500 hover:bg-orange-600 text-gray-900 font-semibold px-8 py-2.5 rounded shadow-sm transition-transform transform hover:scale-105"
          style={{
            backgroundColor: settings.HERO_4_BTN_BG_COLOR || undefined,
            color: settings.HERO_4_BTN_TEXT_COLOR || undefined
          }}
        >
          Shop Now
        </Link>
      </div>
      {settings.HERO_4_IMAGE ? (
        <img src={settings.HERO_4_IMAGE} alt="Hero 4" className="absolute right-0 sm:right-4 md:right-16 bottom-0 w-[50%] max-w-[300px] md:max-w-none md:max-h-[120%] object-contain group-hover:-translate-y-4 transition-transform duration-500 z-10" />
      ) : (
        <div className="absolute -right-10 sm:right-4 md:right-16 -bottom-10 w-56 h-56 sm:w-64 sm:h-64 transition-transform duration-500 group-hover:-translate-y-4 z-10 scale-75 sm:scale-100 origin-bottom-right">
          <div className="absolute inset-x-8 top-0 h-32 border-[12px] border-red-500 rounded-t-[4rem] border-b-0"></div>
          <div className="absolute bottom-8 left-4 w-20 h-28 bg-pink-300 rounded-[2rem] shadow-lg rotate-12"></div>
          <div className="absolute bottom-8 right-4 w-20 h-28 bg-pink-300 rounded-[2rem] shadow-lg -rotate-12"></div>
        </div>
      )}
    </div>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 w-full py-6 font-sans">
      {/* DESKTOP VIEW */}
      <div className="hidden lg:grid grid-cols-12 gap-6 h-[600px]">
        <div className="col-span-4 h-full">
          {block1}
        </div>
        <div className="col-span-8 flex flex-col gap-6 h-full">
          <div className="grid grid-cols-2 gap-6 h-[50%]">
            {block2}
            {block3}
          </div>
          <div className="h-[50%]">
            {block4}
          </div>
        </div>
      </div>

      {/* MOBILE VIEW (AutoSlider) */}
      <HeroMobileSliderWrapper>
        {settings.HERO_1_HIDE_MOBILE !== 'true' && block1}
        {settings.HERO_2_HIDE_MOBILE !== 'true' && block2}
        {settings.HERO_3_HIDE_MOBILE !== 'true' && block3}
        {settings.HERO_4_HIDE_MOBILE !== 'true' && block4}
      </HeroMobileSliderWrapper>
    </section>
  );
}
