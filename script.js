const uploader = document.getElementById('uploader');
const fileInput = document.getElementById('fileInput');
const chooseBtn = document.getElementById('chooseBtn');
const preview = document.getElementById('preview');
const canvas = document.getElementById('canvas');
const removeBtn = document.getElementById('removeBtn');
const downloadLink = document.getElementById('downloadLink');
const ctx = canvas.getContext('2d');

// open file dialog
chooseBtn.addEventListener('click', () => fileInput.click());

// drag & drop
['dragover','drop'].forEach(evt => {
  uploader.addEventListener(evt, e => {
    e.preventDefault();
    if (evt === 'drop') handleFile(e.dataTransfer.files[0]);
  });
});

fileInput.addEventListener('change', e => handleFile(e.target.files[0]));

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    preview.classList.remove('hidden');
  };
  img.src = URL.createObjectURL(file);
}

// call remove.bg
removeBtn.addEventListener('click', async () => {
  removeBtn.textContent = 'Processing…';
  const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
  const form = new FormData();
  form.append('image_file', blob);
  form.append('size', 'auto');

  try {
    const res = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': 'Rf4FEsFLWJgifp6Q6UV29QUx' },
      body: form
    });
    if (!res.ok) throw await res.text();
    const outBlob = await res.blob();
    const url = URL.createObjectURL(outBlob);
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(img,0,0);
      downloadLink.href = url;
      downloadLink.classList.remove('hidden');
      removeBtn.textContent = 'Done!';
    };
    img.src = url;
  } catch (err) {
    alert('Error: ' + err);
    removeBtn.textContent = 'Remove Background';
  }
});
function downloadCanvasImage(canvas, filename = 'image.png') {
  canvas.toBlob(function(blob) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;

    // iOS Safari fix – must append to DOM
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  }, 'image/png');
}

// Hook for download button
downloadLink.addEventListener('click', e => {
  e.preventDefault(); // stop default behavior
  downloadCanvasImage(canvas); // call with your canvas
});

