document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION & DPI CALCULATIONS ---
    // A4 at 96 DPI screen representation
    const A4_WIDTH_PX = 794;   // 210mm
    const A4_HEIGHT_PX = 1123; // 297mm

    // CR80 / Kenyan ID physical size
    const ID_WIDTH_MM = 85.6;
    const ID_HEIGHT_MM = 53.98;

    const MM_TO_PX = A4_WIDTH_PX / 210;
    const ID_WIDTH_PX = ID_WIDTH_MM * MM_TO_PX;   // ~323.7 px
    const ID_HEIGHT_PX = ID_HEIGHT_MM * MM_TO_PX; // ~204.1 px

    // Output resolution: 300 DPI target. Canvas is 96 DPI, so 300 / 96 = 3.125
    // -> 2481 x 3509 px for the full A4 sheet
    const EXPORT_MULTIPLIER = 300 / 96;
    const EXPORT_QUALITY = 0.95;

    // State
    let frontImgObj = null;
    let backImgObj = null;
    let cropper = null;
    let marginGuideObj = null;

    // --- FABRIC CANVAS ---
    const canvas = new fabric.Canvas('id-canvas', {
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        backgroundColor: '#ffffff',
        selection: true
    });

    const drawPageMarginGuides = () => {
        marginGuideObj = new fabric.Rect({
            left: 20,
            top: 20,
            width: A4_WIDTH_PX - 40,
            height: A4_HEIGHT_PX - 40,
            fill: 'transparent',
            stroke: '#E2E8F0',
            strokeWidth: 1,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false
        });
        canvas.add(marginGuideObj);
    };
    drawPageMarginGuides();

    // --- HI-RES RENDER (shared by print and PDF) ---
    // Hides the margin guide and selection handles, renders at 300 DPI,
    // then restores the guide.
    const renderHiRes = (format = 'jpeg') => {
        canvas.discardActiveObject();

        const wasVisible = marginGuideObj ? marginGuideObj.visible : false;
        if (marginGuideObj) marginGuideObj.visible = false;
        canvas.renderAll();

        const url = canvas.toDataURL({
            format,
            quality: EXPORT_QUALITY,
            multiplier: EXPORT_MULTIPLIER
        });

        if (marginGuideObj) marginGuideObj.visible = wasVisible;
        canvas.renderAll();
        return url;
    };

    // --- PRINT SHEET (hi-res image swapped in at print time) ---
    // Created here so no HTML changes are needed.
    const printSheet = document.createElement('img');
    printSheet.id = 'print-sheet';
    printSheet.alt = '';
    document.body.appendChild(printSheet);

    const printStyle = document.createElement('style');
    printStyle.textContent = `
        #print-sheet { display: none; }
        @page { size: A4; margin: 0; }
        @media print {
            html, body { margin: 0; padding: 0; background: #fff; }
            body > *:not(#print-sheet) { display: none !important; }
            #print-sheet { display: block; width: 210mm; height: 297mm; }
        }
    `;
    document.head.appendChild(printStyle);

    // --- SHARED: STYLE + ADD IMAGE TO CANVAS ---
    const styleImage = (img) => {
        img.set({
            cornerColor: '#0D9488',
            cornerStyle: 'circle',
            borderColor: '#0D9488',
            cornerSize: 10,
            transparentCorners: false
        });
    };

    const addImageFromDataUrl = (dataUrl, { left, top, role = null } = {}) => {
        fabric.Image.fromURL(dataUrl, (img) => {
            // Scale proportionally by width to preserve aspect ratio
            const scale = ID_WIDTH_PX / img.width;
            img.set({ scaleX: scale, scaleY: scale, left, top });
            styleImage(img);
            img.setCoords();

            if (role === 'front') {
                if (frontImgObj) canvas.remove(frontImgObj);
                frontImgObj = img;
            } else if (role === 'back') {
                if (backImgObj) canvas.remove(backImgObj);
                backImgObj = img;
            }

            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
        });
    };

    // --- FILE INPUT UPLOAD ---
    const handleFileUpload = (e, isFront = true) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';

        const reader = new FileReader();
        reader.onload = (event) => {
            const left = (A4_WIDTH_PX - ID_WIDTH_PX) / 2;
            addImageFromDataUrl(event.target.result, {
                left,
                top: isFront ? 100 : 100 + ID_HEIGHT_PX + 30,
                role: isFront ? 'front' : 'back'
            });
        };
        reader.readAsDataURL(file);
    };

    document.getElementById('front-id-input').addEventListener('change', (e) => handleFileUpload(e, true));
    document.getElementById('back-id-input').addEventListener('change', (e) => handleFileUpload(e, false));

    // --- QUICK PRESETS ---

    // Stacked (top and bottom)
    document.getElementById('preset-stacked').addEventListener('click', () => {
        const activeObjs = canvas.getObjects().filter(obj => obj.type === 'image');
        if (activeObjs.length === 0) return alert("Please upload at least one ID image first.");

        const startY = 120;
        const centerX = (A4_WIDTH_PX - ID_WIDTH_PX) / 2;

        activeObjs.forEach((img, idx) => {
            img.set({
                left: centerX,
                top: startY + idx * (ID_HEIGHT_PX + 40),
                angle: 0
            });
            img.scaleToWidth(ID_WIDTH_PX);
            img.setCoords();
        });
        canvas.renderAll();
    });

    // Side by side
    document.getElementById('preset-side').addEventListener('click', () => {
        const activeObjs = canvas.getObjects().filter(obj => obj.type === 'image');
        if (activeObjs.length < 2) return alert("Please upload both Front and Back ID images.");

        const gap = 30;
        const totalWidth = (ID_WIDTH_PX * 2) + gap;
        const startX = (A4_WIDTH_PX - totalWidth) / 2;

        activeObjs[0].set({ left: startX, top: 150, angle: 0 });
        activeObjs[1].set({ left: startX + ID_WIDTH_PX + gap, top: 150, angle: 0 });

        activeObjs.forEach(img => {
            img.scaleToWidth(ID_WIDTH_PX);
            img.setCoords();
        });
        canvas.renderAll();
    });

    // --- CROP MODE ---
    const cropModal = document.getElementById('crop-modal');
    const cropImgElement = document.getElementById('crop-image');

    document.getElementById('crop-btn').addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (!activeObj || activeObj.type !== 'image') {
            return alert("Please click and select an ID image on the canvas to crop.");
        }

        // Original full-res source, not the scaled canvas render
        const src = activeObj._element ? activeObj._element.src : activeObj.toDataURL();
        cropImgElement.src = src;

        cropModal.classList.add('active');

        if (cropper) cropper.destroy();
        cropper = new Cropper(cropImgElement, {
            viewMode: 1,
            autoCropArea: 0.95,
            responsive: true
        });
    });

    const closeCropModal = () => {
        cropModal.classList.remove('active');
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    };

    document.getElementById('close-modal-btn').addEventListener('click', closeCropModal);
    document.getElementById('cancel-crop-btn').addEventListener('click', closeCropModal);

    document.getElementById('apply-crop-btn').addEventListener('click', () => {
        if (!cropper) return;

        const activeObj = canvas.getActiveObject();
        if (!activeObj) return;

        // Full-resolution crop, lossless PNG
        const croppedCanvas = cropper.getCroppedCanvas({
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        const croppedDataUrl = croppedCanvas.toDataURL('image/png');

        const { left, top, angle } = activeObj;

        activeObj.setSrc(croppedDataUrl, () => {
            const croppedScale = ID_WIDTH_PX / activeObj.width;
            activeObj.set({
                left,
                top,
                angle,
                scaleX: croppedScale,
                scaleY: croppedScale
            });
            activeObj.setCoords();
            canvas.renderAll();
            closeCropModal();
        });
    });

    // --- LAYER ORDERING & MARGIN TOGGLE ---
    document.getElementById('bring-forward-btn').addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            canvas.bringForward(activeObj);
            canvas.renderAll();
        }
    });

    document.getElementById('send-backward-btn').addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            canvas.sendBackwards(activeObj);
            canvas.renderAll();
        }
    });

    document.getElementById('toggle-margin-btn').addEventListener('click', () => {
        if (marginGuideObj) {
            marginGuideObj.set('visible', !marginGuideObj.visible);
            canvas.renderAll();
        }
    });

    // --- TOOL ACTIONS ---
    document.getElementById('rotate-btn').addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.rotate((activeObj.angle + 90) % 360);
            activeObj.setCoords();
            canvas.renderAll();
        }
    });

    document.getElementById('center-h-btn').addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.centerH();
            activeObj.setCoords();
            canvas.renderAll();
        }
    });

    document.getElementById('delete-btn').addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            canvas.remove(activeObj);
            if (activeObj === frontImgObj) frontImgObj = null;
            if (activeObj === backImgObj) backImgObj = null;
            canvas.renderAll();
        }
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        if (confirm("Are you sure you want to clear the sheet?")) {
            canvas.clear();
            frontImgObj = null;
            backImgObj = null;

            document.getElementById('front-id-input').value = '';
            document.getElementById('back-id-input').value = '';

            canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
            drawPageMarginGuides();
        }
    });

    // --- DIRECT PRINT (300 DPI) ---
    document.getElementById('print-btn').addEventListener('click', () => {
        printSheet.onload = () => {
            printSheet.onload = null;
            window.print();
        };
        printSheet.src = renderHiRes('jpeg');
    });

    // Free the large image once the print dialog closes
    window.addEventListener('afterprint', () => {
        printSheet.removeAttribute('src');
    });

    // --- PDF EXPORT (300 DPI) ---
    document.getElementById('export-pdf-btn').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        pdf.addImage(renderHiRes('jpeg'), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        pdf.save(`Huduma_ID_Print_${new Date().toISOString().slice(0, 10)}.pdf`);
    });

    // --- DRAG AND DROP OVERLAY ---
    const dragOverlay = document.getElementById('drag-drop-overlay');
    let dragCounter = 0; // prevents flicker over child elements

    window.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dragCounter++;
        if (e.dataTransfer.types && e.dataTransfer.types.includes('Files')) {
            dragOverlay.classList.add('active');
        }
    });

    window.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragCounter--;
        if (dragCounter <= 0) {
            dragCounter = 0;
            dragOverlay.classList.remove('active');
        }
    });

    window.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    window.addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;
        dragOverlay.classList.remove('active');

        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length === 0) return;

        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                addImageFromDataUrl(event.target.result, {
                    left: (A4_WIDTH_PX - ID_WIDTH_PX) / 2 + (index * 25),
                    top: 120 + (index * (ID_HEIGHT_PX + 30))
                });
            };
            reader.readAsDataURL(file);
        });
    });

    // --- PASTE IMAGE FROM CLIPBOARD (CTRL+V) ---
    window.addEventListener('paste', (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;

        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                e.preventDefault();

                const reader = new FileReader();
                reader.onload = (event) => {
                    addImageFromDataUrl(event.target.result, {
                        left: (A4_WIDTH_PX - ID_WIDTH_PX) / 2,
                        top: 150
                    });
                };
                reader.readAsDataURL(item.getAsFile());
                break; // one pasted image at a time
            }
        }
    });
});