
window.addEventListener("DOMContentLoaded", () => {
  const labelContainer = document.getElementById("labelContainer");
  const titleInput = document.getElementById("titleInput");
  const barcodeInput = document.getElementById("barcodeInput");

  // Title dropdown
  const titleSelect = document.getElementById("titleSelect");

  const colorSelector = document.querySelector(".color-selector");
  const colorSelected = colorSelector.querySelector(".color-selected");
  const colorOptions = colorSelector.querySelectorAll(".color-option");

  let selectedColor = "default";
  colorSelected.textContent = "Select label Color";

  const editSelectedBtn = document.getElementById("editSelected");
  const clearSelectionBtn = document.getElementById("clearSelection");
  const batchToggleBtn = document.getElementById("batchToggle");
  const selectAllBtn = document.getElementById("selectAll");
  const clearAllBtn = document.getElementById("clearAll");
  const printPdfBtn = document.getElementById("printPDF");
  const feedbackBtn = document.getElementById("feedbackBtn");

  if (!labelContainer) return;

  let batchMode = false;
  let selectedLabels = [];

  // -------------------------------
  // ⭐ NEW: highlight-next functionality
  // -------------------------------
  function highlightNextLabel() {
    document.querySelectorAll(".batch-focus").forEach(el =>
      el.classList.remove("batch-focus")
    );

    if (!batchMode || selectedLabels.length === 0) return;

    const next = selectedLabels[0];
    if (next) next.classList.add("batch-focus");
  }

  let calibrationX = 0;
  let calibrationY = 0;

  function createLabelGrid(rows = 15, cols = 4) {
    labelContainer.innerHTML = "";
    const total = rows * cols;

    for (let i = 0; i < total; i++) {
      const label = document.createElement("div");
      label.classList.add("label");
      label.dataset.index = i;
      label.dataset.color = "default";

      const inner = document.createElement("div");
      inner.classList.add("label-inner");

      const indexTag = document.createElement("div");
      indexTag.classList.add("label-index");
      indexTag.textContent = i + 1;

      const titleDiv = document.createElement("div");
      titleDiv.classList.add("label-title");

      const barcodeDiv = document.createElement("div");
      barcodeDiv.classList.add("label-barcode");

      const subtitleDiv = document.createElement("div");
      subtitleDiv.classList.add("label-subtitle");

      inner.appendChild(indexTag);
      inner.appendChild(titleDiv);
      inner.appendChild(barcodeDiv);
      inner.appendChild(subtitleDiv);
      label.appendChild(inner);

      // UPDATED: now supports highlightNextLabel()
      label.addEventListener("click", () => {
        if (!selectedLabels.includes(label)) {
          selectedLabels.push(label);
          label.classList.add("selected");
        } else {
          selectedLabels = selectedLabels.filter(l => l !== label);
          label.classList.remove("selected");
        }

        if (batchMode) highlightNextLabel();
      });

      labelContainer.appendChild(label);
    }
  }

  createLabelGrid();

  let zoom = 1;
  const zoomStep = 0.1;
  const maxZoom = 2.0;
  const minZoom = 0.5;

  const zoomInBtn = document.getElementById("zoomIn");
  const zoomOutBtn = document.getElementById("zoomOut");
  const zoomLevelText = document.getElementById("zoomLevel");

  function updateZoom() {
    labelContainer.style.transformOrigin = "top center";
    labelContainer.style.transform = `scale(${zoom})`;
    zoomLevelText.textContent = `${Math.round(zoom * 100)}%`;
  }

  zoomInBtn.addEventListener("click", () => {
    if (zoom < maxZoom) zoom += zoomStep;
    updateZoom();
  });

  zoomOutBtn.addEventListener("click", () => {
    if (zoom > minZoom) zoom -= zoomStep;
    updateZoom();
  });

  // Show/hide custom title input
  titleSelect.addEventListener("change", () => {
    if (titleSelect.value === "custom") {
      titleInput.style.display = "inline-block";
      titleInput.focus();
    } else {
      titleInput.style.display = "none";
      titleInput.value = "";
    }
  });

  function updateLabelBarcodeUI(label, barcodeText) {
    const barcodeDiv = label.querySelector(".label-barcode");
    barcodeDiv.innerHTML = "";
    const span = document.createElement("span");
    span.textContent = barcodeText;
    span.style.backgroundColor = "white";
    span.style.padding = "1px 2px";
    span.style.borderRadius = "2px";
    span.style.display = "inline-block";
    span.style.fontFamily = "CCode39";
    span.style.fontSize = "15px";
    barcodeDiv.appendChild(span);
  }

  function safeAddListener(el, event, handler) {
    if (el) el.addEventListener(event, handler);
  }

  // -------------------------------
  // Batch mode toggle (updated)
  // -------------------------------
  safeAddListener(batchToggleBtn, "click", () => {
   batchMode = !batchMode;

if (batchMode) {
    // ON → neon green
    batchToggleBtn.style.backgroundColor = "#39ff14";
    batchToggleBtn.style.color = "#000";
    batchToggleBtn.style.borderColor = "#39ff14";
    batchToggleBtn.style.boxShadow = "0 0 10px #39ff14, 0 0 20px #39ff14";
} else {
    // OFF → reset to normal header button styling
    batchToggleBtn.style.backgroundColor = "#f7f9fc";
    batchToggleBtn.style.color = "#1f2933";
    batchToggleBtn.style.borderColor = "#d0d7e2";
    batchToggleBtn.style.boxShadow = "none";
}

    if (batchMode) highlightNextLabel();
  });

  const form = document.getElementById("barcodeForm");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 80) {
      form.classList.add("scrolled");
    } else {
      form.classList.remove("scrolled");
    }
  });

  function applyColor(label, color) {
    label.dataset.color = color || "default";
    label.style.background = "white";
    const titleDiv = label.querySelector(".label-title");

    if (!color || color === "default") {
      titleDiv.style.color = "black";
      return;
    }

    let selectedColorHex;
    switch (color) {
      case "blue": selectedColorHex = "#045BDC"; break;
      case "red": selectedColorHex = "#FF1A1A"; break;
      case "yellow": selectedColorHex = "#FFD700"; break;
      case "green": selectedColorHex = "#32CD32"; break;
      case "orange": selectedColorHex = "#FFA500"; break;
      default: selectedColorHex = "white";
    }

    if (color === "blue") {
      label.style.background = `linear-gradient(to bottom, ${selectedColorHex} 0%, ${selectedColorHex} 50%, white 50%, white 100%)`;
    } else {
      label.style.background = `linear-gradient(to bottom, #0000FF 0%, #0000FF 25%, ${selectedColorHex} 25%, ${selectedColorHex} 50%, white 50%, white 100%)`;
    }

    titleDiv.style.color = ["red","green","orange","blue","yellow"].includes(color)
      ? "white"
      : "black";
  }

  colorSelected.addEventListener("click", () => colorSelector.classList.toggle("active"));
  colorOptions.forEach(option => {
    option.addEventListener("click", () => {
      selectedColor = option.dataset.color;
      colorSelected.textContent = option.textContent;
      colorSelector.classList.remove("active");
      if (selectedLabels.length > 0)
        selectedLabels.forEach(label => applyColor(label, selectedColor));
    });
  });

  document.addEventListener("click", (e) => {
    if (!colorSelector.contains(e.target)) {
      colorSelector.classList.remove("active");
    }
  });

  // -------------------------------
  // Edit labels (updated for batch highlight)
  // -------------------------------
    function editLabels() {
        if (selectedLabels.length === 0) return;

        // Determine title
        let titleVal = "";

    switch (titleSelect.value) {
    case "default":
        titleVal = "Fresno Unified School District - SERIAL";
        break;

    case "fusd":
        titleVal = "Fresno Unified School District";
        break;

    case "custom":
        titleVal = titleInput.value.trim() || "";
        break;
}

        const barcodeVal = barcodeInput.value.trim();

        // -----------------------------
        // BATCH MODE — edit only FIRST
        // -----------------------------
        if (batchMode) {
            const currentLabel = selectedLabels[0];
            const currentIndex = parseInt(currentLabel.dataset.index);

            const titleDiv = currentLabel.querySelector(".label-title");
            const subtitleDiv = currentLabel.querySelector(".label-subtitle");

            titleDiv.textContent = titleVal;

            if (barcodeVal) {
                let serial = barcodeVal;
                const match = barcodeVal.match(/(.*?)(\d+)$/);

                if (match) {
                    const prefix = match[1];
                    const startNum = parseInt(match[2], 10);
                    const numLength = match[2].length;
                    serial = prefix + String(startNum).padStart(numLength, "0");

                    // auto-increment for next scan
                    barcodeInput.value = prefix + String(startNum + 1).padStart(numLength, "0");
                }

                updateLabelBarcodeUI(currentLabel, `*${serial}*`);
                subtitleDiv.textContent = serial;
            }

            if (selectedColor) applyColor(currentLabel, selectedColor);

            currentLabel.classList.remove("selected");
            currentLabel.classList.remove("batch-focus");

            // Move to next label
            const nextIndex = currentIndex + 1;
            if (nextIndex < labelContainer.children.length) {
                const nextLabel = labelContainer.children[nextIndex];
                selectedLabels = [nextLabel];
                nextLabel.classList.add("selected");
                nextLabel.classList.add("batch-focus");
                nextLabel.scrollIntoView({ behavior: "smooth", block: "center" });
            } else {
                selectedLabels = [];
            }
// --- Always prepare barcode box for next scan ---
barcodeInput.value = "";
setTimeout(() => barcodeInput.focus(), 30);

// Re-highlight next label (scanner flow)
if (batchMode) highlightNextLabel();
            return;
          

        }

        // ----------------------------------------
        // NON-BATCH MODE — Edit *all* selected
        // ----------------------------------------
        selectedLabels.forEach(label => {
            const titleDiv = label.querySelector(".label-title");
            const subtitleDiv = label.querySelector(".label-subtitle");

            titleDiv.textContent = titleVal;

            if (barcodeVal) {
                updateLabelBarcodeUI(label, `*${barcodeVal}*`);
                subtitleDiv.textContent = barcodeVal;
            }

            if (selectedColor) applyColor(label, selectedColor);

            label.classList.remove("selected");
        });

        selectedLabels = [];
        barcodeInput.value = "";
    }




  safeAddListener(editSelectedBtn, "click", editLabels);
  [titleInput, barcodeInput].forEach(input =>
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        editLabels();
      }
    })
  );

  safeAddListener(clearSelectionBtn, "click", () => {
    selectedLabels.forEach(label => {
      label.querySelector(".label-title").textContent = "";
      label.querySelector(".label-barcode").innerHTML = "";
      label.querySelector(".label-subtitle").textContent = "";
      label.dataset.color = "default";
      label.style.background = "white";
      label.classList.remove("selected");
      label.querySelector(".label-title").style.color = "black";
    });
    selectedLabels = [];
  });

  safeAddListener(selectAllBtn, "click", () => {
    selectedLabels = [];
    labelContainer.querySelectorAll(".label").forEach(label => {
      selectedLabels.push(label);
      label.classList.add("selected");
    });

    if (batchMode) highlightNextLabel();
  });

  safeAddListener(clearAllBtn, "click", () => {
    labelContainer.querySelectorAll(".label").forEach(label => {
      label.querySelector(".label-title").textContent = "";
      label.querySelector(".label-barcode").innerHTML = "";
      label.querySelector(".label-subtitle").textContent = "";
      label.dataset.color = "default";
      label.style.background = "white";
      label.classList.remove("selected");
      label.querySelector(".label-title").style.color = "black";
    });
    selectedLabels = [];
  });

// Scanner automatically triggers "change" (not Enter)
// This ensures: update → clear field → refocus → next label ready
barcodeInput.addEventListener("change", () => {
  editLabels();              // update the label(s)
  barcodeInput.value = "";   // clear for next scan
  setTimeout(() => barcodeInput.focus(), 20); // keep cursor ready
});

  const exportBtn = document.getElementById("exportExcel");
  safeAddListener(exportBtn, "click", () => {
    let csvContent = "data:text/csv;charset=utf-8,Title,Serial\n";
    labelContainer.querySelectorAll(".label").forEach(label => {
      const title = label.querySelector(".label-title")?.textContent || "";
      const serial = label.querySelector(".label-subtitle")?.textContent || "";
      if (title || serial) csvContent += `${title},${serial}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "labels.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // -------------------------------------------------------------------
  // Calibration modal & Print PDF (unchanged)
  // -------------------------------------------------------------------

  const calibrationModal = document.createElement("div");
  calibrationModal.id = "calibrationModal";
  calibrationModal.style.display = "none";
  calibrationModal.innerHTML = `
    <div class="modal-content">
      <h4>Calibration (Adjust Margins if Needed)</h4>
      <label>
        Left(-)/Right(+) (X, mm):
        <input type="number" id="modalCalibrationX" value="0" step="0.5">
      </label>
      <label>
        Up(-)/Down(+) (Y, mm):
        <input type="number" id="modalCalibrationY" value="0" step="0.5">
      </label>
      <div style="margin-top:15px;">
        <button id="modalApplyCalibration">Print</button>
        <button id="modalResetCalibration">Reset</button>
        <button id="modalCloseCalibration">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(calibrationModal);

  const modalX = document.getElementById("modalCalibrationX");
  const modalY = document.getElementById("modalCalibrationY");
  const modalApply = document.getElementById("modalApplyCalibration");
  const modalReset = document.getElementById("modalResetCalibration");
  const modalClose = document.getElementById("modalCloseCalibration");

  printPdfBtn.addEventListener("click", () => {
    modalX.value = (calibrationX * 25.4).toFixed(1);
    modalY.value = (calibrationY * 25.4).toFixed(1);
    calibrationModal.style.display = "flex";
  });

  modalApply.addEventListener("click", () => {
    calibrationX = parseFloat(modalX.value) / 25.4 || 0;
    calibrationY = parseFloat(modalY.value) / 25.4 || 0;
    calibrationModal.style.display = "none";
    printPDFWithCalibration();
  });

  modalReset.addEventListener("click", () => {
    calibrationX = 0;
    calibrationY = 0;
    modalX.value = 0;
    modalY.value = 0;
    alert("Calibration reset to 0 mm");
  });

  modalClose.addEventListener("click", () => calibrationModal.style.display = "none");

  const feedbackModalElem = document.createElement("div");
  feedbackModalElem.id = "feedbackModal";
  feedbackModalElem.style.position = "fixed";
  feedbackModalElem.style.top = "0";
  feedbackModalElem.style.left = "0";
  feedbackModalElem.style.width = "100%";
  feedbackModalElem.style.height = "100%";
  feedbackModalElem.style.backgroundColor = "rgba(0,0,0,0.5)";
  feedbackModalElem.style.display = "none";
  feedbackModalElem.style.justifyContent = "center";
  feedbackModalElem.style.alignItems = "center";
  feedbackModalElem.style.zIndex = "1000";
  feedbackModalElem.innerHTML = `
    <div class="modal-content" style="
      background: #111;
      color: #fff;
      padding: 20px;
      border-radius: 12px;
      min-width: 300px;
      max-width: 90%;
      text-align: center;
    ">
      <h4>Send Feedback</h4>
      <p>I'd love your feedback on this label maker!</p>
      <button id="feedbackLink" style="
        background: #005a9e;
        color: white;
        font-weight: bold;
        padding: 10px 20px;
        border: 2px solid #005a9e;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      ">Go to Form</button>
      <br/>
      <button id="feedbackModalClose" style="
        margin-top: 15px;
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        background: #ff1a1a;
        color: #fff;
        cursor: pointer;
        transition: all 0.2s ease;
      ">Close</button>
    </div>
  `;
  document.body.appendChild(feedbackModalElem);

  const feedbackLink = document.getElementById("feedbackLink");
  const feedbackClose = document.getElementById("feedbackModalClose");

  feedbackLink.addEventListener("click", () => {
    window.open("https://forms.office.com/r/XyFMpjNwma", "_blank");
  });

  feedbackBtn.addEventListener("click", () => {
    feedbackModalElem.style.display = "flex";
  });

  feedbackClose.addEventListener("click", () => {
    feedbackModalElem.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === feedbackModalElem) {
      feedbackModalElem.style.display = "none";
    }
  });

  // ---------------------------
  // Print logic (unchanged)
  // ---------------------------
  function printPDFWithCalibration() {
    const allLabels = Array.from(labelContainer.querySelectorAll(".label")).slice(0, 60);
    const printWindow = window.open("", "_blank");

    const cols = 4;
    const rows = 15;
    const labelWidthIn = 1.75;
    const labelHeightIn = 0.66;
    const horizontalGap = 0.30;
    const verticalGap = 0.0;

    const pageWidth = 8.5;
    const pageHeight = 11;

    const baselineXOffset = 0.50 / 25.4;
    const baselineYOffset = 0.28 / 25.4;

    const gridWidth = cols * labelWidthIn + (cols - 1) * horizontalGap;
    const gridHeight = rows * labelHeightIn + (rows - 1) * verticalGap;

    const offsetX = (pageWidth - gridWidth) / 2 + baselineXOffset + calibrationX;
    const offsetY = (pageHeight - gridHeight) / 2 + baselineYOffset + calibrationY;

    const style = document.createElement("style");
    style.textContent = `
      @font-face {
        font-family: 'CCod39';
        src: url('CCode39.ttf') format('truetype');
      }
      @page { size: letter; margin: 0; }
      body {
        font-family: Arial, sans-serif;
        display: grid;
        grid-template-columns: repeat(${cols}, ${labelWidthIn}in);
        grid-auto-rows: ${labelHeightIn}in;
        column-gap: ${horizontalGap}in;
        row-gap: ${verticalGap}in;
        justify-content: flex-start;
        margin-left: ${offsetX}in;
        margin-top: ${offsetY}in;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .label {
        border-radius: 11px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 2px;
      }
      .label-inner {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      }
      .label-title {
        font-weight: bold;
        font-size: 10px;
        margin-bottom: 0px;
        margin-top: 2px;
      }
      .label-barcode span {
        font-family: 'CCode39';
        font-size: 14px;
        background-color: white;
        padding: 1px 1px;
        border-radius: 2px;
        transform: scaleY(.8);
        display: inline-block;
      }
      .label-subtitle {
        font-size: 10px;
        margin-top: 0px;
        font-weight: bold;
      }
    `;

    printWindow.document.head.appendChild(style);

    allLabels.forEach(label => {
      const clone = label.cloneNode(true);

      const labelStyle = window.getComputedStyle(label);
      clone.style.background = labelStyle.background;
      clone.style.borderRadius = labelStyle.borderRadius;

      const idxEl = clone.querySelector(".label-index");
      if (idxEl) idxEl.remove();

      const title = clone.querySelector(".label-title");
      const titleStyle = window.getComputedStyle(label.querySelector(".label-title"));
      title.style.color = titleStyle.color;
      title.style.fontSize = titleStyle.fontSize;
      title.style.fontWeight = titleStyle.fontWeight;

      const barcode = clone.querySelector(".label-barcode");
      const barcodeStyle = window.getComputedStyle(label.querySelector(".label-barcode"));
      barcode.style.fontFamily = barcodeStyle.fontFamily;

      const subtitle = clone.querySelector(".label-subtitle");
      const subtitleStyle = window.getComputedStyle(label.querySelector(".label-subtitle"));
      subtitle.style.color = subtitleStyle.color;
      subtitle.style.fontSize = subtitleStyle.fontSize;

      printWindow.document.body.appendChild(clone);
    });

    printWindow.onafterprint = () => printWindow.close();
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
});


