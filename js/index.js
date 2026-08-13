document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION & DPI CALCULATIONS ---
    // Standard A4 dimensions at standard screen DPI (~96DPI representation)
    const A4_WIDTH_PX = 794;  // equivalent to 210mm
    const A4_HEIGHT_PX = 1123; // equivalent to 297mm

    // Kenyan / CR80 ID standard real physical size in millimeters
    const ID_WIDTH_MM = 85.6;
    const ID_HEIGHT_MM = 53.98;

    // Convert Millimeters to Canvas Pixels
    const MM_TO_PX = A4_WIDTH_PX / 210;
    const ID_WIDTH_PX = ID_WIDTH_MM * MM_TO_PX;   // ~323.7 px
    const ID_HEIGHT_PX = ID_HEIGHT_MM * MM_TO_PX; // ~204.1 px

    // State Variables
    let frontImgObj = null;
    let backImgObj = null;
    let cropper = null;

    // --- INITIALIZE FABRIC.JS CANVAS ---
    const canvas = new fabric.Canvas('id-canvas', {
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        backgroundColor: '#ffffff',
        selection: true
    });

    // Render page border visual helper inside canvas
    const drawPageMarginGuides = () => {
        const margin = new fabric.Rect({
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
        canvas.add(margin);
    };
    drawPageMarginGuides();

    // --- HELPER FUNCTION: Add & Auto-Resize Image ---
    const handleFileUpload = (e, isFront = true) => {
        const file = e.target.files[0];
        if (!file) return;

        e.target.value = '';

        const reader = new FileReader();
        reader.onload = function (event) {
            fabric.Image.fromURL(event.target.result, (img) => {
                
                // Scale proportionally based on width to preserve original aspect ratio
                const scale = ID_WIDTH_PX / img.width;
                img.set({
                    scaleX: scale,
                    scaleY: scale
                });
                img.setCoords();

                // Add custom corner styles for sleek UI
                img.set({
                    cornerColor: '#0D9488',
                    cornerStyle: 'circle',
                    borderColor: '#0D9488',
                    cornerSize: 10,
                    transparentCorners: false
                });

                if (isFront) {
                    if (frontImgObj) canvas.remove(frontImgObj);
                    frontImgObj = img;
                    // Position Front ID near top
                    frontImgObj.set({ left: (A4_WIDTH_PX - ID_WIDTH_PX) / 2, top: 100 });
                } else {
                    if (backImgObj) canvas.remove(backImgObj);
                    backImgObj = img;
                    // Position Back ID directly below Front ID
                    backImgObj.set({ left: (A4_WIDTH_PX - ID_WIDTH_PX) / 2, top: 100 + ID_HEIGHT_PX + 30 });
                }

                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
            });
        };
        reader.readAsDataURL(file);
    };

    // Event Listeners for File Inputs
    document.getElementById('front-id-input').addEventListener('change', (e) => handleFileUpload(e, true));
    document.getElementById('back-id-input').addEventListener('change', (e) => handleFileUpload(e, false));

    // --- QUICK PRESETS LOGIC ---
    
    // Preset 1: Standard Vertically Stacked (Top & Bottom)
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
        });
        canvas.renderAll();
    });

    // Preset 2: Side by Side
    document.getElementById('preset-side').addEventListener('click', () => {
        const activeObjs = canvas.getObjects().filter(obj => obj.type === 'image');
        if (activeObjs.length < 2) return alert("Please upload both Front and Back ID images.");

        const gap = 30;
        const totalWidth = (ID_WIDTH_PX * 2) + gap;
        const startX = (A4_WIDTH_PX - totalWidth) / 2;

        activeObjs[0].set({ left: startX, top: 150, angle: 0 });
        activeObjs[1].set({ left: startX + ID_WIDTH_PX + gap, top: 150, angle: 0 });

        activeObjs.forEach(img => img.scaleToWidth(ID_WIDTH_PX));
        canvas.renderAll();
    });

    // --- CROP MODE LOGIC ---
    const cropModal = document.getElementById('crop-modal');
    const cropImgElement = document.getElementById('crop-image');

    // Open Crop Modal
    document.getElementById('crop-btn').addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (!activeObj || activeObj.type !== 'image') {
            return alert("Please click and select an ID image on the canvas to crop.");
        }

        // Convert fabric image to Data URL for Cropper.js
        const src = activeObj.toDataURL();
        cropImgElement.src = src;

        // Show modal
        cropModal.classList.add('active');

        // Initialize Cropper.js
        if (cropper) cropper.destroy();
        cropper = new Cropper(cropImgElement, {
            viewMode: 1,
            autoCropArea: 0.9,
            responsive: true
        });
    });

    // Close Modal Helper
    const closeCropModal = () => {
        cropModal.classList.remove('active');
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    };

    document.getElementById('close-modal-btn').addEventListener('click', closeCropModal);
    document.getElementById('cancel-crop-btn').addEventListener('click', closeCropModal);

    // Apply Crop Back to Fabric Canvas
    document.getElementById('apply-crop-btn').addEventListener('click', () => {
        if (!cropper) return;

        const activeObj = canvas.getActiveObject();
        if (!activeObj) return;

        // Get cropped image canvas from Cropper.js
        const croppedCanvas = cropper.getCroppedCanvas();
        const croppedDataUrl = croppedCanvas.toDataURL();

        // Store current dimensions & position
        const left = activeObj.left;
        const top = activeObj.top;
        const angle = activeObj.angle;

        // Update source of the Fabric Image
        activeObj.setSrc(croppedDataUrl, () => {
            activeObj.set({
                left: left,
                top: top,
                angle: angle
            });
            // Scale proportionally after cropping to preserve aspect ratio
            const croppedScale = ID_WIDTH_PX / activeObj.width;
            activeObj.set({
                scaleX: croppedScale,
                scaleY: croppedScale
            });
            activeObj.setCoords();
            canvas.renderAll();
            closeCropModal();
        });
    });

    // --- TOOL ACTIONS ---

    // Rotate Selected Object by 90 degrees
    document.getElementById('rotate-btn').addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.rotate((activeObj.angle + 90) % 360);
            canvas.renderAll();
        }
    });

    // Center Horizontally
    document.getElementById('center-h-btn').addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            activeObj.centerH();
            canvas.renderAll();
        }
    });

    // Delete Selected Image
    document.getElementById('delete-btn').addEventListener('click', () => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            canvas.remove(activeObj);
            if (activeObj === frontImgObj) frontImgObj = null;
            if (activeObj === backImgObj) backImgObj = null;
            canvas.renderAll();
        }
    });

    // Reset Canvas
    document.getElementById('reset-btn').addEventListener('click', () => {
        if (confirm("Are you sure you want to clear the sheet?")) {
            canvas.clear();
            frontImgObj = null;
            backImgObj = null;

            // Clear file input values
            document.getElementById('front-id-input').value = '';
            document.getElementById('back-id-input').value = '';

            canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
            drawPageMarginGuides();
        }
    });

    // --- DIRECT PRINT MODE ---
    document.getElementById('print-btn').addEventListener('click', () => {
        // Deselect active image so selection boxes don't appear in print
        canvas.discardActiveObject();
        canvas.renderAll();

        // Trigger native browser print dialog
        window.print();
    });

    // --- PDF EXPORT FUNCTIONALITY ---
    document.getElementById('export-pdf-btn').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;

        // Create A4 PDF instance in Portrait (mm units)
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Deselect objects to remove transformation bounding box controls before capture
        canvas.discardActiveObject();
        canvas.renderAll();

        // Convert Fabric Canvas to High-Res Data URL
        const dataURL = canvas.toDataURL({
            format: 'jpeg',
            quality: 1.0,
            multiplier: 2 // Boost resolution 2x for sharp printing
        });

        // Add Image to PDF fitting exactly to A4 proportions (210mm x 297mm)
        pdf.addImage(dataURL, 'JPEG', 0, 0, 210, 297);
        
        // Save PDF with clear naming
        pdf.save(`Huduma_ID_Print_${new Date().toISOString().slice(0, 10)}.pdf`);
    });

    // --- DRAG AND DROP OVERLAY LOGIC ---
        const dragOverlay = document.getElementById('drag-drop-overlay');
        let dragCounter = 0; // Fixes flickering when hovering over child elements

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
                    fabric.Image.fromURL(event.target.result, (img) => {
                        // Proportional scale to standard width
                        const scale = ID_WIDTH_PX / img.width;
                        img.set({
                            scaleX: scale,
                            scaleY: scale,
                            cornerColor: '#0D9488',
                            cornerStyle: 'circle',
                            borderColor: '#0D9488',
                            cornerSize: 10,
                            transparentCorners: false,
                            left: (A4_WIDTH_PX - ID_WIDTH_PX) / 2 + (index * 25),
                            top: 120 + (index * (ID_HEIGHT_PX + 30))
                        });
                        img.setCoords();
                        canvas.add(img);
                        canvas.setActiveObject(img);
                        canvas.renderAll();
                    });
                };
                reader.readAsDataURL(file);
            });
        });
});