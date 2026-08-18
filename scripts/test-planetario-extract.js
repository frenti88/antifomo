async function inspectJS() {
  const url = 'https://www.planetariomedellin.org/programate/lectura-infantil-diez-lunas-para-una-espera-de-velia-vidal';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  
  const scripts = [...html.matchAll(/src="(\/_next\/static\/[^"]+)"/g)].map(m => m[1]);
  console.log('Scripts count:', scripts.length);

  for (const s of scripts) {
    const sRes = await fetch('https://www.planetariomedellin.org' + s);
    const sText = await sRes.text();
    const urls = sText.match(/https?:\/\/[a-zA-Z0-9\.\-\_\/\?\=\&\%\:]+/g) || [];
    const filtered = urls.filter(u => u.includes('api') || u.includes('cosmic') || u.includes('graphql') || u.includes('content'));
    if (filtered.length > 0) {
      console.log('Found endpoints in', s, ':', [...new Set(filtered)]);
    }
  }
}
inspectJS();
