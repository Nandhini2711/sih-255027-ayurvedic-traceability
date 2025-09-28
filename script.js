// Frontend-only demo logic

function el(id){return document.getElementById(id)}

// Create a demo payload object and a QR using external generator
function createPayload(name, batch, coords){
  const payload = {
    herb: name || "Unknown herb",
    batch: batch || "BATCH-000",
    capturedAt: new Date().toISOString(),
    geo: coords || null,
    note: "Demo frontend-only record"
  }
  return payload
}

function makeQrUrl(dataStr){
  // Uses a public QR image service to preview a QR (frontend-only)
  const encoded = encodeURIComponent(dataStr)
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`
}

// Capture geo and generate demo QR
el('captureBtn').addEventListener('click', ()=>{
  const name = el('herbName').value.trim()
  const batch = el('batchId').value.trim() || `BATCH-${Math.floor(Math.random()*900+100)}`
  const resultDiv = el('demoResult')
  resultDiv.textContent = 'Trying to get location from browser...'
  if(!navigator.geolocation){
    resultDiv.textContent = 'Geolocation not supported by this browser.'
    const payload = createPayload(name, batch, null)
    showQr(payload)
    return
  }

  navigator.geolocation.getCurrentPosition((position)=>{
    const coords = {
      lat: position.coords.latitude.toFixed(6),
      lon: position.coords.longitude.toFixed(6),
      accuracy: position.coords.accuracy
    }
    const payload = createPayload(name, batch, coords)
    resultDiv.textContent = `Captured: ${coords.lat}, ${coords.lon}`
    showQr(payload)
  }, (err)=>{
    resultDiv.textContent = 'Location denied or unavailable. Generating QR without geo.'
    const payload = createPayload(name, batch, null)
    showQr(payload)
  }, {enableHighAccuracy:false, timeout:10000})
})

function showQr(payload){
  const dataStr = JSON.stringify(payload)
  el('qrImg').src = makeQrUrl(dataStr)
  el('qrImg').alt = 'QR for ' + payload.batch
  el('qrData').textContent = dataStr
}

// Simulate scanning: look up a fake trace history
el('scanBtn').addEventListener('click', ()=>{
  const bid = el('scanInput').value.trim()
  const out = el('traceOutput')
  if(!bid){ out.textContent = 'Enter a batch id to simulate.'; return }
  // Demo fake history (frontend-only)
  const history = [
    {time:'2025-09-01', event:'Collected by Farmer A', location:'12.9716,77.5946'},
    {time:'2025-09-03', event:'Quality check by Collector B', location:'12.9750,77.5910'},
    {time:'2025-09-07', event:'Processing — dried & batch packed', location:'12.9800,77.6000'},
    {time:'2025-09-12', event:'Dispatched to Manufacturer', location:'12.9850,77.6100'}
  ]
  out.innerHTML = `<strong>Trace for ${bid}</strong><br>` + history.map(h=>`• ${h.time} — ${h.event} (${h.location})`).join('<br>')
})

// optional: show an initial demo QR
document.addEventListener('DOMContentLoaded', ()=>{
  const demo = createPayload('Ashwagandha','BATCH-DEMO-001',{lat:'12.971600',lon:'77.594600'})
  showQr(demo)
})
