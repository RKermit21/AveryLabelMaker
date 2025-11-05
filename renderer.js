window.addEventListener("DOMContentLoaded", () => {
  const labelContainer = document.getElementById("labelContainer");
  const titleInput = document.getElementById("titleInput");
  const barcodeInput = document.getElementById("barcodeInput");

  // ✅ NEW — title dropdown
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

      const titleDiv = document.createElement("div");
      titleDiv.classList.add("label-title");
      label.appendChild(titleDiv);

      const barcodeDiv = document.createElement("div");
      barcodeDiv.classList.add("label-barcode");
      label.appendChild(barcodeDiv);

      const subtitleDiv = document.createElement("div");
      subtitleDiv.classList.add("label-subtitle");
      label.appendChild(subtitleDiv);

      label.addEventListener("click", () => {
        if (!selectedLabels.includes(label)) {
          selectedLabels.push(label);
          label.classList.add("selected");
        } else {
          selectedLabels = selectedLabels.filter((l) => l !== label);
          label.classList.remove("selected");
        }
      });

      labelContainer.appendChild(label);
    }
  }
  createLabelGrid();

  // ✅ NEW — Show/hide custom title box
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

  safeAddListener(batchToggleBtn, "click", () => {
    batchMode = !batchMode;
    batchToggleBtn.style.backgroundColor = batchMode ? "#39ff14" : "#005a9e";
    batchToggleBtn.style.color = batchMode ? "#000" : "#fff";
    batchToggleBtn.style.boxShadow = batchMode ? "0 0 10px #39ff14, 0 0 20px #39ff14" : "none";
  });

  const form = document.getElementById("barcodeForm");
  window.addEventListener("scroll", () => {
    if (window.scrollY > form.offsetTop - 60) form.classList.add("scrolled");
    else form.classList.remove("scrolled");
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

    titleDiv.style.color = ["red", "green", "orange", "blue", "yellow"].includes(color) ? "white" : "black";
  }

  colorSelected.addEventListener("click", () => colorSelector.classList.toggle("active"));
  colorOptions.forEach(option => {
    option.addEventListener("click", () => {
      selectedColor = option.dataset.color;
      colorSelected.textContent = option.textContent;
      colorSelector.classList.remove("active");
      if (selectedLabels.length > 0) selectedLabels.forEach(label => applyColor(label, selectedColor));
    });
  });

  document.addEventListener("click", (e) => {
    if (!colorSelector.contains(e.target)) colorSelector.classList.remove("active");
  });

  // ✅ UPDATED — title selection logic added
  function editLabels() {
    if (selectedLabels.length === 0) return;

    let titleVal = "Fresno Unified School District";
    if (titleSelect.value === "custom" && titleInput.value.trim() !== "") {
      titleVal = titleInput.value.trim();
    }

    const barcodeVal = barcodeInput.value.trim();

    selectedLabels.forEach((label, idx) => {
      const titleDiv = label.querySelector(".label-title");
      const subtitleDiv = label.querySelector(".label-subtitle");

      titleDiv.textContent = titleVal;

      if (barcodeVal) {
        let serial = barcodeVal;
        const match = barcodeVal.match(/(.*?)(\d+)$/);
        if (batchMode && match) {
          const prefix = match[1];
          const startNum = parseInt(match[2], 10);
          const numLength = match[2].length;
          serial = prefix + String(startNum + idx).padStart(numLength, "0");
        }
        updateLabelBarcodeUI(label, `*${serial}*`);
        subtitleDiv.textContent = serial;
      }

      if (selectedColor) applyColor(label, selectedColor);
      label.classList.remove("selected");
    });

    selectedLabels = batchMode ? [labelContainer.children[parseInt(selectedLabels.pop().dataset.index) + 1]] : [];
    barcodeInput.value = "";
  }

  safeAddListener(editSelectedBtn, "click", editLabels);
  [titleInput, barcodeInput].forEach(input => input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); editLabels(); }
  }));

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

  safeAddListener(barcodeInput, "change", editLabels);

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
    calibrationX = parseFloat(modalX.value)/25.4 || 0;
    calibrationY = parseFloat(modalY.value)/25.4 || 0;
    calibrationModal.style.display = "none";
    printPDFWithCalibration(); // ✅ still here, print works
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

  feedbackBtn.addEventListener("click", () => feedbackModalElem.style.display = "flex");
  feedbackClose.addEventListener("click", () => feedbackModalElem.style.display = "none");
  window.addEventListener("click", (e) => { if (e.target === feedbackModalElem) feedbackModalElem.style.display = "none"; });

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

    const baselineXOffset = .50 / 25.4;
    const baselineYOffset = .28 / 25.4;

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
      .label-title {
        font-weight: bold;
        font-size: 8px;
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
