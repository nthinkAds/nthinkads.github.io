/* =====================================================================
   N Think — site content
   Edit this file to change clients, services, figures and projects.
   No build step: save, refresh the page, done.
   ===================================================================== */

// Client strip: the 14 brands listed on nthink.lk (name is the alt text; logo is in assets/clients)
window.CLIENTS = [
  ['Nestlé Professional', 'nestle-professional'], ['NESCAFÉ', 'nescafe'], ['Maliban', 'maliban'], ['Nestomalt', 'nestomalt'],
  ['MAGGI Professional', 'maggi-professional'], ['Milkmaid', 'milkmaid'], ['Kevilton', 'kevilton'],
  ['Wise Freight Logistics', 'wise-freight'], ['Almarai', 'almarai'], ['Samrin Tea', 'samrin'],
  ['Pepper Cube', 'pepper-cube'], ['Hiru', 'hiru'], ['PLL', 'pll'], ['Nestlé', 'nestle']
];

// Key figures for the Studio section (value + what it means)
window.FIGURES = [
  ['15+', 'years of industry leadership'],
  ['360°', 'integrated creative solutions'],
  ['100%', 'boutique focus and attention'],
  ['05', 'core creative disciplines'],
  ['14', 'iconic brands and collaborations']
];

// The five disciplines: picture, short description and tags
window.DISCIPLINES = [
  { name: 'Brand identity', img: 'assets/work/identities/02.webp', text: 'Strategy first, then the marks, type and systems that let a brand stay recognisable everywhere it shows up.',
    tags: ['Brand strategy', 'Visual identity', 'Typography', 'Guidelines', 'Design systems'] },
  { name: 'Promotional design', img: 'assets/work/maggi-pro-posm/08.webp', text: 'Campaign key visuals and everything that carries them: magazine pages, hoardings, pennants, pull-ups and brochures.',
    tags: ['Campaign design', 'Editorial print', 'Outdoor', 'Brochures', 'Key visuals'] },
  { name: 'Packaging', img: 'assets/work/rushi-salt/02.webp', text: 'Packs that win the two seconds a shopper gives a shelf, built to print cleanly at scale.',
    tags: ['Structural packaging', 'Luxury labels', 'Consumer packs', 'Unboxing'] },
  { name: 'Creative content', img: 'assets/work/pepper-cube-social/02.webp', text: 'Social campaigns, motion and art direction that keep a brand talking between launches.',
    tags: ['Digital content', 'Social campaigns', 'Art direction', 'Storytelling', 'Motion'] },
  { name: 'Photography and videography', img: 'assets/video/nestea.jpg', text: 'Food, product and people, shot and graded in-house so the film matches the print.',
    tags: ['Cinematography', 'Commercial photography', 'Direction', '35mm stills', 'Colour grading'] }
];

// Logos section: brand marks N Think designed (img: trimmed logo; index: its image in the 'identities' project viewer)
window.LOGOS = [
  { name: 'IIME', sector: 'Education', img: 'assets/logos/iime.webp', index: 0 },
  { name: 'Alfa Marine', sector: 'Marine', img: 'assets/logos/alfa-marine.webp', index: 1 },
  { name: 'Murray Institute of Business', sector: 'Education', img: 'assets/logos/murray.webp', index: 2 },
  { name: 'Yara', sector: 'Ceylon tea', img: 'assets/logos/yara.webp', index: 3 }
];

// Filter categories for the gallery (key: label)
window.CATEGORIES = {
  campaign: 'Campaigns',
  promo: 'Promotional',
  outdoor: 'Outdoor',
  print: 'Print and editorial',
  pack: 'Packaging',
  identity: 'Brand identity',
  space: 'Spaces and events',
  social: 'Social',
  motion: 'Motion'
};

/* Helper that builds the image list for a project folder.
   sizes: [width, height] of each large image, so the grid can reserve space and not jump while loading. */
function imgs(slug, sizes) {
  return sizes.map(function (s, i) {
    var n = String(i + 1).padStart(2, '0');
    return { src: 'assets/work/' + slug + '/' + n + '.webp', thumb: 'assets/work/' + slug + '/' + n + '-t.webp', w: s[0], h: s[1] };
  });
}
// Helper for a film: compressed mp4 plus its poster frame
function film(name, w, h) {
  return { video: 'assets/video/' + name + '.mp4', thumb: 'assets/video/' + name + '.jpg', w: w, h: h };
}
var P = [1080, 1350], L = [1280, 720]; // portrait social and landscape film shapes

/* Projects. featured: true puts it in the three large slots at the top.
   Add a project: copy one block, point imgs() at a new folder in assets/work. */
window.PROJECTS = [
  { id: 'kevilton-nature', featured: true, cat: 'campaign', client: 'Kevilton', title: 'Nature Series',
    text: 'A full-page magazine campaign that puts Kevilton switches in rooms worth living in, with a family of layouts for Lanka Woman.',
    media: imgs('kevilton-nature', [[1178,1600],[1188,1600],[1186,1600],[1122,1514],[1186,1600]]) },
  { id: 'np-stall', featured: true, cat: 'space', client: 'Nestlé Professional', title: 'Exhibition stall, 2025',
    text: 'A trade stall designed in 3D: warm timber, lit signage and shelving built to show the full range.',
    media: imgs('np-stall', Array(10).fill([1401,934])) },
  { id: 'maggi-pro-posm', featured: true, cat: 'promo', client: 'MAGGI Professional', title: 'Create dishes worth celebrating',
    text: '5 ft pennants and point-of-sale for the MAGGI Professional range, each product given its own hero dish.',
    media: imgs('maggi-pro-posm', [[640,1600],[640,1600],[640,1600],[640,1600],[640,1600],[640,1600],[640,1600],[1600,1066],[750,1000],[750,1000]]) },

  { id: 'nescafe-pro-posm', cat: 'promo', client: 'NESCAFÉ Professional', title: 'Café-style pennants',
    text: 'Point-of-sale for NESCAFÉ, Coffee-mate, MILO and NESTEA in foodservice outlets.',
    media: imgs('nescafe-pro-posm', [[640,1600],[640,1600],[640,1600],[640,1600],[640,1600],[640,1600],[1131,1600]]) },
  { id: 'nescafe-outdoor', cat: 'outdoor', client: 'NESCAFÉ', title: 'Beverage Solutions and Drink & Drive',
    text: 'Building hoarding, event backdrop and a 60 × 20 ft highway hoarding.',
    media: imgs('nescafe-outdoor', [[1323,1600],[1080,378],[1600,533]]) },
  { id: 'np-recipe-book', cat: 'print', client: 'Nestlé Professional', title: 'Recipe book',
    text: 'A chef-facing recipe book: soups, mains and desserts, with a calm, generous layout.',
    media: imgs('np-recipe-book', Array(7).fill([1600,811])) },
  { id: 'nestle-office', cat: 'space', client: 'Nestlé', title: 'Office interior',
    text: 'Interior visualisation for a training and meeting space, from seating plan to brand walls.',
    media: imgs('nestle-office', Array(10).fill([1446,811])) },
  { id: 'kevilton-electrical', cat: 'promo', client: 'Kevilton', title: 'Pull-up banners',
    text: 'Product explainers for RCCBs, MCBs and LED bulbs that work at retail distance.',
    media: imgs('kevilton-electrical', [[800,1600],[800,1600],[800,1600]]) },
  { id: 'nescafe-recipe-book', cat: 'print', client: 'NESCAFÉ', title: 'The NESCAFÉ Story recipe book',
    text: 'Coffee desserts and drinks, photographed and laid out as a keepsake book.',
    media: imgs('nescafe-recipe-book', [[1100,1100],[1100,1100],[1100,1100],[800,1600],[1100,1582],[1100,1582],[968,1600],[1100,1582]]) },
  { id: 'hiru-foods', cat: 'outdoor', client: 'Hiru', title: 'Hoarding and fleet branding',
    text: 'Roadside hoarding, installed, and a branded delivery fleet.',
    media: imgs('hiru-foods', [[1600,1178],[1600,776]]) },
  { id: 'nestle-planner', cat: 'print', client: 'Nestlé Lanka', title: '2026 planner',
    text: 'A year planner with food photography for every month.',
    media: imgs('nestle-planner', Array(7).fill([980,1448])) },
  { id: 'rushi-salt', cat: 'pack', client: 'Rushi Salt', title: '400 g pack',
    text: 'Consumer pack design and print-ready flat artwork.',
    media: imgs('rushi-salt', [[1500,1482],[1600,1067]]) },
  { id: 'identities', cat: 'identity', client: 'Various', title: 'Identities',
    text: 'Marks and stationery for Alfa Marine, IIME, Murray Institute of Business and Yara tea.',
    media: imgs('identities', [[1575,1600],[1600,1501],[788,513],[1539,652]]) },
  { id: 'maggi-brochures', cat: 'print', client: 'MAGGI', title: 'Product brochures',
    text: 'Range brochures and leaflets for trade and retail.',
    media: imgs('maggi-brochures', [[1131,1600],[791,1600],[1600,401],[1600,401]]) },
  { id: 'maggi-activation', cat: 'space', client: 'MAGGI', title: 'Brand activation',
    text: 'A branded event dome and a stall concept sketch.',
    media: imgs('maggi-activation', [[1280,590],[780,520]]) },
  { id: 'pepper-cube-social', cat: 'social', client: 'Pepper Cube', title: 'Seasonal social posts',
    text: 'A year of festival and awareness-day posts in one consistent system.',
    media: imgs('pepper-cube-social', Array(14).fill([1080,1080])) },
  { id: 'jr-ceylon', cat: 'social', client: 'JR Ceylon Holidays', title: 'Discover Sri Lanka',
    text: 'Social key visual for a Sri Lankan tour operator.',
    media: imgs('jr-ceylon', [[1024,1024]]) },

  // Films (category: motion)
  { id: 'nestea', cat: 'motion', client: 'NESTEA', title: 'Iced Tea film', media: [film('nestea', L[0], L[1])] },
  { id: 'maggi-sauce', cat: 'motion', client: 'MAGGI', title: 'MAGGI Sauce film', media: [film('maggi-sauce', L[0], L[1])] },
  { id: 'frio', cat: 'motion', client: 'Frio', title: 'Launch film', media: [film('frio', L[0], L[1])] },
  { id: 'cold-milo', cat: 'motion', client: 'MILO', title: 'Cold MILO', media: [film('cold-milo', L[0], L[1])] },
  { id: 'masala', cat: 'motion', client: 'MAGGI', title: 'Masala film', media: [film('masala', L[0], L[1])] },
  { id: 'nestle-2d', cat: 'motion', client: 'Nestlé', title: '2D animation', media: [film('nestle-2d', L[0], L[1])] },
  { id: 'nestle-cream', cat: 'motion', client: 'Nestlé', title: 'Nestlé Cream', media: [film('nestle-cream', L[0], L[1])] },
  { id: 'cheese-kottu', cat: 'motion', client: 'MAGGI', title: 'Cheese kottu recipe', media: [film('cheese-kottu', P[0], P[1])] },
  { id: 'maggi-aurudu', cat: 'motion', client: 'MAGGI', title: 'Avurudu greeting', media: [film('maggi-aurudu', P[0], P[1])] },
  { id: 'food-fx', cat: 'motion', client: 'Nestlé Professional', title: 'Food FX shorts',
    media: [film('np-aurudu', P[0], P[1]), film('fx-flare', P[0], P[1]), film('potato-fx', P[0], P[1]), film('rasamusu', P[0], P[1])] },
  { id: 'logo-reveal', cat: 'motion', client: 'Studio', title: 'Logo reveal', media: [film('logo-reveal', L[0], L[1])] }
];
