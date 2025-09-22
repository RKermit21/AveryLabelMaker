window.addEventListener("DOMContentLoaded", () => {
  const labelContainer = document.getElementById("labelContainer");
  const titleInput = document.getElementById("titleInput");
  const barcodeInput = document.getElementById("barcodeInput");

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

  const exportBtn = document.createElement("button");
  exportBtn.id = "exportExcel";
  exportBtn.textContent = "Export to Excel";
  printPdfBtn.parentNode.insertBefore(exportBtn, printPdfBtn);

  if (!labelContainer) return;

  let batchMode = false;
  let selectedLabels = [];

  // --- Generate label grid ---
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

  // --- Helper: update barcode UI ---
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

  // --- Batch toggle ---
  safeAddListener(batchToggleBtn, "click", () => {
    batchMode = !batchMode;
    if (batchMode) {
      batchToggleBtn.style.backgroundColor = "#39ff14";
      batchToggleBtn.style.color = "#000";
      batchToggleBtn.style.boxShadow = "0 0 10px #39ff14, 0 0 20px #39ff14";
    } else {
      batchToggleBtn.style.backgroundColor = "#005a9e";
      batchToggleBtn.style.color = "#fff";
      batchToggleBtn.style.boxShadow = "none";
    }
  });

  // --- Sticky form shadow ---
  const form = document.getElementById("barcodeForm");
  window.addEventListener("scroll", () => {
    if (window.scrollY > form.offsetTop - 60) {
      form.classList.add("scrolled");
    } else {
      form.classList.remove("scrolled");
    }
  });

  // --- Apply color to label ---
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
      case "skyblue": selectedColorHex = "#87CEEB"; break;
      case "red": selectedColorHex = "#FF6347"; break;
      case "yellow": selectedColorHex = "#FFD700"; break;
      case "green": selectedColorHex = "#32CD32"; break;
      case "orange": selectedColorHex = "#FFA500"; break;
      default: selectedColorHex = "white";
    }

    if (color === "skyblue") {
      label.style.background = `linear-gradient(to bottom, ${selectedColorHex} 0%, ${selectedColorHex} 50%, white 50%, white 100%)`;
    } else {
      label.style.background = `linear-gradient(to bottom, #0000FF 0%, #0000FF 25%, ${selectedColorHex} 25%, ${selectedColorHex} 50%, white 50%, white 100%)`;
    }

    if (["red", "green", "orange", "blue"].includes(color)) {
      titleDiv.style.color = "white";
    } else {
      titleDiv.style.color = "black";
    }
  }

  // --- Color dropdown ---
  colorSelected.addEventListener("click", () => colorSelector.classList.toggle("active"));
  colorOptions.forEach(option => {
    option.addEventListener("click", () => {
      selectedColor = option.dataset.color;
      colorSelected.textContent = option.textContent;
      colorSelector.classList.remove("active");

      if (selectedLabels.length > 0) {
        selectedLabels.forEach(label => applyColor(label, selectedColor));
      }
    });
  });
  document.addEventListener("click", (e) => {
    if (!colorSelector.contains(e.target)) colorSelector.classList.remove("active");
  });

  // --- Edit labels ---
  function editLabels() {
    if (selectedLabels.length === 0) return;

    const titleVal = titleInput.value;
    const barcodeVal = barcodeInput.value.trim();

    selectedLabels.forEach((label, idx) => {
      const titleDiv = label.querySelector(".label-title");
      const subtitleDiv = label.querySelector(".label-subtitle");

      if (titleVal) titleDiv.textContent = titleVal;

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

    if (batchMode) {
      const lastLabel = selectedLabels[selectedLabels.length - 1];
      const nextIndex = parseInt(lastLabel.dataset.index) + 1;
      selectedLabels = [];
      if (nextIndex < labelContainer.children.length) {
        const nextLabel = labelContainer.children[nextIndex];
        selectedLabels.push(nextLabel);
        nextLabel.classList.add("selected");
      }
    } else {
      selectedLabels = [];
    }

    barcodeInput.value = "";
  }

  safeAddListener(editSelectedBtn, "click", editLabels);

  [titleInput, barcodeInput].forEach(input => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); editLabels(); }
    });
  });

  // --- Clear selection ---
  safeAddListener(clearSelectionBtn, "click", () => {
    selectedLabels.forEach(label => {
      label.querySelector(".label-title").textContent = "";
      label.querySelector(".label-barcode").innerHTML = "";
      label.querySelector(".label-subtitle").textContent = "";
      label.dataset.color = "default";
      label.style.background = "white";
      label.classList.remove("selected", "skyblue", "red", "yellow", "green", "orange");
      label.querySelector(".label-title").style.color = "black";
    });
    selectedLabels = [];
  });

  safeAddListener(selectAllBtn, "click", () => {
    selectedLabels = [];
    labelContainer.querySelectorAll(".label").forEach((label) => {
      selectedLabels.push(label);
      label.classList.add("selected");
    });
  });

  safeAddListener(clearAllBtn, "click", () => {
    labelContainer.querySelectorAll(".label").forEach((label) => {
      label.querySelector(".label-title").textContent = "";
      label.querySelector(".label-barcode").innerHTML = "";
      label.querySelector(".label-subtitle").textContent = "";
      label.dataset.color = "default";
      label.style.background = "white";
      label.classList.remove("selected", "skyblue", "red", "yellow", "green", "orange");
      label.querySelector(".label-title").style.color = "black";
    });
    selectedLabels = [];
  });

  safeAddListener(barcodeInput, "change", editLabels);

  // --- Export to Excel ---
  safeAddListener(exportBtn, "click", () => {
    const serials = Array.from(labelContainer.querySelectorAll(".label-subtitle"))
                         .map(el => el.textContent)
                         .filter(txt => txt);
    if (serials.length === 0) { alert("No serials to export!"); return; }

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

  // --- Print PDF ---
// --- Print PDF with adjustable gaps ---
safeAddListener(printPdfBtn, "click", () => {
  const allLabels = Array.from(labelContainer.querySelectorAll(".label")).slice(0, 60); // 4x15 max
  const printWindow = window.open("", "_blank");

  // --- Editable gaps (in inches) ---
  let horizontalGap = 0.28; // horizontal spacing between labels
  let verticalGap = 0.00;   // vertical spacing between labels

  const style = document.createElement("style");
  style.textContent = `
    body {
  font-family: Arial, sans-serif;
  margin: 0.6in 0.5in 0.4in 0.5in;
  display: grid;
  grid-template-columns: repeat(4, 1.75in);
  grid-auto-rows: 0.667in;
  column-gap: ${horizontalGap}in;
  row-gap: ${verticalGap}in;
  justify-content: center; /* center horizontally */
}
    .label {
      width: 1.75in;
      height: 0.667in;
      position: relative;
      box-sizing: border-box;
        /* border: 1px solid #ccc;  <-- remove this */
      border-radius: 6px 6px 0 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      padding: 2px 0;
    }
    .label-title { font-size: 8px; margin-top 2px; font-weight: bold; text-align: center; width: 85%; z-index: 2; }
    .label-barcode {
      font-family: "CCode39", monospace;
      font-size: 6px;
      text-align: center;
      display: block;
      padding: 0px 2px;
      border-radius: 1px;
      background: white;
      z-index: 2;
      width: 85%;
      margin: 0px auto 0;
    }
    .label-subtitle { font-size: 8px; text-align: center; width: 100%; z-index: 2; margin-top: 0px; }
    .bg-div { position: absolute; left: 0; width: 100%; z-index: 0; border-radius: 6px 6px 0 0; }
  `;
  printWindow.document.head.appendChild(style);

  allLabels.forEach(label => {
    const clone = label.cloneNode(true);
    clone.style.transform = "none";
    clone.style.boxShadow = "none";

    const color = clone.dataset.color || "default";

    if (color === "skyblue") {
      const bgDiv = document.createElement("div");
      bgDiv.className = "bg-div";
      bgDiv.style.top = "0";
      bgDiv.style.height = "50%";
      bgDiv.style.backgroundColor = "#87CEEB";
      clone.insertBefore(bgDiv, clone.firstChild);
      clone.querySelector(".label-title").style.color = "black";
    } else if (["red", "yellow", "green", "orange"].includes(color)) {
      const topDiv = document.createElement("div");
      topDiv.className = "bg-div";
      topDiv.style.top = "0";
      topDiv.style.height = "25%";
      topDiv.style.backgroundColor = "#0000FF";
      clone.insertBefore(topDiv, clone.firstChild);

      const colorDiv = document.createElement("div");
      colorDiv.className = "bg-div";
      colorDiv.style.top = "25%";
      colorDiv.style.height = "25%";
      colorDiv.style.backgroundColor = {
        red: "#FF6347",
        yellow: "#FFD700",
        green: "#32CD32",
        orange: "#FFA500"
      }[color];
      clone.appendChild(colorDiv);

      clone.querySelector(".label-title").style.color = "white";
    } else {
      clone.style.backgroundColor = "white";
      clone.querySelector(".label-title").style.color = "black";
    }

    printWindow.document.body.appendChild(clone);
  });

  printWindow.onafterprint = () => printWindow.close();

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
});

});
