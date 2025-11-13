// Topic/Theme sample data per curriculum->grade->subject
const topicThemeData = {
  national: {
    grade1: {
      science: {
        topics: ["Plants", "Animals", "Weather"],
        themes: ["Nature", "Seasons"],
      },
      english: {
        topics: ["Alphabet", "Simple Words"],
        themes: ["Phonics", "Stories"],
      },
      mathematics: {
        topics: ["Numbers", "Addition"],
        themes: ["Counting", "Basics"],
      },
      social: { topics: ["Family", "Community"], themes: ["Citizenship"] },
    },
    grade3: {
      science: {
        topics: ["Photosynthesis", "States of Matter"],
        themes: ["Ecosystems", "Materials"],
      },
    },
  },
  integrated: {
    grade1: {
      literacy: {
        topics: ["Letters", "Rhymes"],
        themes: ["Reading", "Speaking"],
      },
      numeracy: {
        topics: ["Counting", "Shapes"],
        themes: ["Numbers", "Geometry"],
      },
    },
  },
  cambridge: {
    year1: {
      science: {
        topics: ["Living Things", "Materials"],
        themes: ["Inquiry", "Observation"],
      },
    },
  },
};

const populateTopicTheme = () => {
  // Query DOM locally so this works outside initDependentSelects scope
  const curriculumSelect = document.getElementById("curriculum-select");
  const gradeSelect = document.getElementById("grade-select");
  const subjectSelect = document.getElementById("subject-select");
  const topicSelect = document.getElementById("topic-select");
  const themeSelect = document.getElementById("theme-select");
  if (
    !curriculumSelect ||
    !gradeSelect ||
    !subjectSelect ||
    !topicSelect ||
    !themeSelect
  )
    return;

  const setPlaceholder = (select, text) => {
    if (!select) return;
    select.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = text;
    select.appendChild(opt);
  };

  const populateSelect = (select, items) => {
    if (!select || !Array.isArray(items)) return;
    items.forEach((item) => {
      const opt = document.createElement("option");
      if (typeof item === "string") {
        opt.value = item.toLowerCase().replace(/\s+/g, "-");
        opt.textContent = item;
      } else {
        opt.value = item.id;
        opt.textContent = item.label;
      }
      select.appendChild(opt);
    });
  };

  // Reset Topic and Theme placeholders
  setPlaceholder(topicSelect, "Select Topic");
  setPlaceholder(themeSelect, "Select Theme");

  const cur = curriculumSelect.value;
  const grade = gradeSelect.value;
  const subjVal = subjectSelect.value;
  if (!cur || !grade || !subjVal) {
    topicSelect.disabled = true;
    themeSelect.disabled = true;
    return;
  }

// ----- Step navigation and UI updates -----
function showStep(step) {
  const steps = Array.from(document.querySelectorAll('.form-step'));
  steps.forEach((el, idx) => el.classList.toggle('active', idx === step - 1));

  // Update step indicators
  const indicators = document.querySelectorAll('.step-indicator');
  indicators.forEach((ind, idx) => {
    ind.classList.toggle('active', idx === step - 1);
    ind.classList.toggle('completed', idx < step - 1);
  });

  // Update current step text
  const cur = document.getElementById('current-step');
  if (cur) cur.textContent = String(step);

  // Buttons
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');

  if (prevBtn) prevBtn.disabled = step === 1;
  if (nextBtn) nextBtn.classList.toggle('hidden', step === totalSteps);
  if (submitBtn) submitBtn.classList.toggle('hidden', step !== totalSteps);

  // Progress bar
  const bar = document.getElementById('progress-bar');
  if (bar) {
    const pct = Math.max(0, Math.min(100, (step - 1) * (100 / (totalSteps - 1))));
    bar.style.width = pct + '%';
  }

  // Initialize dynamic content when entering steps that need it
  if (step === 4) {
    if (document.getElementById('instructional-sequence')?.childElementCount === 0) {
      loadInstructionalSequence();
    }
  } else if (step === 5) {
    if (document.getElementById('assessment-section')?.childElementCount === 0) {
      loadAssessmentSection();
    }
    if (document.getElementById('homework-section')?.childElementCount === 0) {
      loadHomeworkSection();
    }
  } else if (step === 6) {
    setupStarRating();
    setupEmojiRating();
  }
}

function nextStep() {
  if (currentStep < totalSteps) {
    currentStep += 1;
    showStep(currentStep);
  }
}

function previousStep() {
  if (currentStep > 1) {
    currentStep -= 1;
    showStep(currentStep);
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  // Ensure dependent selects and topic/theme wiring
  populateTopicTheme();
  setupResourceBlocks();
  // Eager-load step 4/5 containers if needed later via showStep
  showStep(currentStep);
});

  // Map subject value to key used in topicThemeData (normalize)
  const normalize = (s) => s.toLowerCase().replace(/\s+/g, "-");
  const keyMap = {
    mathematics: "mathematics",
    math: "mathematics",
    english: "english",
    science: "science",
    "social-studies": "social",
    social: "social",
    literacy: "literacy",
    numeracy: "numeracy",
    "world-around-us": "world-around-us",
    steam: "steam",
    "project-based-learning": "project-based-learning",
    "global-perspectives": "global-perspectives",
  };
  const subjKey = keyMap[normalize(subjVal)] || normalize(subjVal);

  const curNode = topicThemeData[cur] || {};
  const gradeNode = curNode[grade] || {};
  const conf = gradeNode[subjKey] || {
    topics: ["General Topic 1", "General Topic 2"],
    themes: ["General Theme"],
  };

  // Populate only Topic and enable it
  populateSelect(topicSelect, conf.topics);
  topicSelect.disabled = false;

  // Populate Theme options but keep disabled until a Topic is chosen
  populateSelect(themeSelect, conf.themes);
  themeSelect.disabled = true;

  // Guarded listener to enable Theme when Topic is selected
  if (!topicSelect.dataset.themeToggleBound) {
    topicSelect.addEventListener("change", () => {
      const hasTopic = !!topicSelect.value;
      // Reset theme selection when topic changes
      themeSelect.value = "";
      themeSelect.disabled = !hasTopic;
    });
    topicSelect.dataset.themeToggleBound = "true";
  }
};
// Lesson Plan ERP JavaScript Functionality

let lessonPlanData = {};
let isDirty = false;
let autoSaveInterval;
let currentStep = 1;
const totalSteps = 6;

// Dummy curriculum -> grades -> subjects data
const curriculumData = {
  national: {
    name: "National Curriculum of Pakistan",
    grades: [
      {
        id: "grade1",
        label: "Grade 1",
        subjects: ["English", "Mathematics", "Science", "Urdu"],
      },
      {
        id: "grade2",
        label: "Grade 2",
        subjects: ["English", "Mathematics", "Science", "Urdu"],
      },
      {
        id: "grade3",
        label: "Grade 3",
        subjects: ["English", "Mathematics", "Science", "Social Studies"],
      },
      {
        id: "grade4",
        label: "Grade 4",
        subjects: ["English", "Mathematics", "Science", "Social Studies"],
      },
      {
        id: "grade5",
        label: "Grade 5",
        subjects: ["English", "Mathematics", "Science", "Social Studies"],
      },
    ],
  },
  integrated: {
    name: "Integrated Curriculum",
    grades: [
      {
        id: "grade1",
        label: "Level 1",
        subjects: ["Literacy", "Numeracy", "World Around Us"],
      },
      {
        id: "grade2",
        label: "Level 2",
        subjects: ["Literacy", "Numeracy", "STEAM"],
      },
      {
        id: "grade3",
        label: "Level 3",
        subjects: ["Literacy", "Numeracy", "Project-Based Learning"],
      },
    ],
  },
  cambridge: {
    name: "Cambridge",
    grades: [
      {
        id: "year1",
        label: "Year 1",
        subjects: ["English", "Mathematics", "Science"],
      },
      {
        id: "year2",
        label: "Year 2",
        subjects: ["English", "Mathematics", "Science"],
      },
      {
        id: "year3",
        label: "Year 3",
        subjects: ["English", "Mathematics", "Science", "Global Perspectives"],
      },
    ],
  },
};

// Initialize dependent selects (Curriculum -> Grade -> Subject)
function initDependentSelects() {
  const curriculumSelect = document.getElementById("curriculum-select");
  const gradeSelect = document.getElementById("grade-select");
  const subjectSelect = document.getElementById("subject-select");
  const topicSelect = document.getElementById("topic-select");
  const themeSelect = document.getElementById("theme-select");

  if (!curriculumSelect || !gradeSelect || !subjectSelect) return;

  // Helpers
  const setPlaceholder = (select, text) => {
    select.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = text;
    select.appendChild(opt);
  };

  const populateSelect = (select, items) => {
    items.forEach((item) => {
      const opt = document.createElement("option");
      if (typeof item === "string") {
        opt.value = item.toLowerCase().replace(/\s+/g, "-");
        opt.textContent = item;
      } else {
        opt.value = item.id;
        opt.textContent = item.label;
      }
      select.appendChild(opt);
    });
  };

  // Initial state
  gradeSelect.disabled = true;
  subjectSelect.disabled = true;
  if (topicSelect) topicSelect.disabled = true;
  if (themeSelect) themeSelect.disabled = true;
  setPlaceholder(gradeSelect, "Select Grade");
  setPlaceholder(subjectSelect, "Select Subject");
  if (topicSelect) setPlaceholder(topicSelect, "Select Topic");
  if (themeSelect) setPlaceholder(themeSelect, "Select Theme");

  // Events
  curriculumSelect.addEventListener("change", () => {
    const key = curriculumSelect.value;
    setPlaceholder(gradeSelect, "Select Grade");
    setPlaceholder(subjectSelect, "Select Subject");
    subjectSelect.disabled = true;
    if (topicSelect) {
      setPlaceholder(topicSelect, "Select Topic");
      topicSelect.disabled = true;
    }
    if (themeSelect) {
      setPlaceholder(themeSelect, "Select Theme");
      themeSelect.disabled = true;
    }

    if (key && curriculumData[key]) {
      populateSelect(gradeSelect, curriculumData[key].grades);
      gradeSelect.disabled = false;
    } else {
      gradeSelect.disabled = true;
    }
  });

  gradeSelect.addEventListener("change", () => {
    const curKey = curriculumSelect.value;
    const gradeId = gradeSelect.value;
    setPlaceholder(subjectSelect, "Select Subject");
    if (topicSelect) {
      setPlaceholder(topicSelect, "Select Topic");
      topicSelect.disabled = true;
    }
    if (themeSelect) {
      setPlaceholder(themeSelect, "Select Theme");
      themeSelect.disabled = true;
    }

    if (curKey && gradeId && curriculumData[curKey]) {
      const grade = curriculumData[curKey].grades.find((g) => g.id === gradeId);
      if (grade) {
        populateSelect(subjectSelect, grade.subjects);
        subjectSelect.disabled = false;
        subjectSelect.addEventListener("change", () => {
          populateTopicTheme();
        });
      } else {
        subjectSelect.disabled = true;
      }
    } else {
      subjectSelect.disabled = true;
    }
  });

  // Pre-populate if values already set (e.g., restored from storage)
  if (curriculumSelect.value) {
    const evt = new Event("change");
    curriculumSelect.dispatchEvent(evt);
    if (gradeSelect.value) {
      gradeSelect.dispatchEvent(new Event("change"));
    }
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  loadInstructionalSequence();
  loadAssessmentSection();
  loadHomeworkSection();
  setupEventListeners();
  startAutoSave();
});

function initializeApp() {
  const savedData = localStorage.getItem("lessonPlanData");
  if (savedData) {
    lessonPlanData = JSON.parse(savedData);
    populateForm();
  }

  // Initialize multi-step form
  initStepIndicators();
  updateStepIndicator();
  updateNavigationButtons();
  updateProgressBar();

  updateProgress();
  createFloatingSaveButton();
  initDependentSelects();
  initSLOBindings();
}

// Bind SLO multi-selects to their textareas
function initSLOBindings() {
  const psychSelect = document.getElementById("psychomotor-select");
  const psychText = document.getElementById("psychomotor-text");
  const affectSelect = document.getElementById("affective-select");
  const affectText = document.getElementById("affective-text");

  // Initialize custom checkbox-style multiselect with selected count
  const initCustomMultiSelect = (selectEl) => {
    if (!selectEl || selectEl.dataset.msInitialized === "true") return;

    // Ensure multiple
    selectEl.multiple = true;
    selectEl.classList.add("hidden");

    const wrapper = document.createElement("div");
    wrapper.className = "ms-wrapper";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "ms-toggle";
    toggle.setAttribute("aria-haspopup", "listbox");
    toggle.setAttribute("aria-expanded", "false");

    const updateToggleText = () => {
      const count = selectEl.selectedOptions
        ? selectEl.selectedOptions.length
        : 0;
      toggle.textContent = count > 0 ? `${count} Selected` : "Select";
    };

    const dropdown = document.createElement("div");
    dropdown.className = "ms-dropdown";
    dropdown.setAttribute("role", "listbox");

    // Build options
    Array.from(selectEl.options).forEach((opt, idx) => {
      if (!opt.value) return; // skip empty placeholder
      const row = document.createElement("label");
      row.className = "ms-option";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "ms-checkbox";
      cb.checked = opt.selected;
      cb.setAttribute("data-value", opt.value);
      cb.addEventListener("change", () => {
        opt.selected = cb.checked;
        selectEl.dispatchEvent(new Event("change", { bubbles: true }));
        updateToggleText();
      });

      const span = document.createElement("span");
      span.className = "ms-label";
      span.textContent = opt.text;

      row.appendChild(cb);
      row.appendChild(span);
      dropdown.appendChild(row);
    });

    // Toggle behavior
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = dropdown.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        // keep dropdown aligned width
        dropdown.style.width = `${wrapper.getBoundingClientRect().width}px`;
      }
      wrapper.classList.toggle("open", open);
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) {
        dropdown.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        wrapper.classList.remove("open");
      }
    });

    wrapper.appendChild(toggle);
    wrapper.appendChild(dropdown);
    // Insert wrapper after select
    selectEl.parentNode.insertBefore(wrapper, selectEl);

    // Sync initial count
    updateToggleText();

    // Keep DOM in sync if programmatically changed
    selectEl.addEventListener("change", () => {
      const selected = new Set(
        Array.from(selectEl.selectedOptions).map((o) => o.value)
      );
      dropdown.querySelectorAll(".ms-checkbox").forEach((cb) => {
        cb.checked = selected.has(cb.getAttribute("data-value"));
      });
      updateToggleText();
    });

    selectEl.dataset.msInitialized = "true";
  };

  initCustomMultiSelect(psychSelect);
  initCustomMultiSelect(affectSelect);

  const updateTextareaFromSelect = (selectEl, textEl) => {
    if (!selectEl || !textEl) return;
    const values = Array.from(selectEl.selectedOptions)
      .map((opt) => (opt.value ? opt.text.trim() : ""))
      .filter(Boolean);
    textEl.value = values.join("\n");
    isDirty = true;
  };

  if (psychSelect && psychText) {
    psychSelect.addEventListener("change", () =>
      updateTextareaFromSelect(psychSelect, psychText)
    );
  }
  if (affectSelect && affectText) {
    affectSelect.addEventListener("change", () =>
      updateTextareaFromSelect(affectSelect, affectText)
    );
  }

  // Pre-populate if selections exist (e.g., browser restores state)
  updateTextareaFromSelect(psychSelect, psychText);
  updateTextareaFromSelect(affectSelect, affectText);
}

function setupEventListeners() {
  const form = document.getElementById("lessonPlanForm");
  form.addEventListener("change", function () {
    isDirty = true;
    updateProgress();
  });

  form.addEventListener("input", function () {
    isDirty = true;
    updateProgress();
  });

  document.querySelectorAll(".tag-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      this.classList.toggle("active");
    });
  });

  setupDragAndDrop();
  setupStarRating();
  setupEmojiRating();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
  });

  window.addEventListener("beforeunload", function (e) {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
}

// Initialize per-section resource blocks: toggles content by type and wires uploads
function setupResourceBlocks() {
  document.querySelectorAll(".resource-block").forEach((block) => {
    // Avoid double-initialization (which causes double Add behavior)
    if (block.dataset.resourcesInitialized === "true") {
      return;
    }
    const addBtn = block.querySelector(".add-resource");
    const list = block.querySelector(".resource-list");

    const wireSingle = () => {
      const typeSelect = block.querySelector(".resource-type");
      const contents = block.querySelectorAll(".resource-content");
      const apply = () => {
        contents.forEach((c) => c.classList.add("hidden"));
        const val = (typeSelect ? typeSelect.value : "").toLowerCase().trim();
        if (val) {
          const active = block.querySelector(
            `.resource-content[data-kind="${val}"]`
          );
          if (active) active.classList.remove("hidden");
          if (val === "supplementary") {
            const dd = active.querySelector(".supp-type");
            if (dd) dd.focus();
          }
        }
      };
      if (typeSelect) {
        typeSelect.addEventListener("change", apply);
        apply();
      }
      block
        .querySelectorAll('.resource-content[data-kind="supplementary"]')
        .forEach((supp) => wireSupplementary(supp));
    };

    const wireSupplementary = (supp) => {
      const typeDd = supp.querySelector(".supp-type");
      const fileInput = supp.querySelector(".supp-file");
      const linkInput = supp.querySelector(".supp-link");
      const uploadArea = supp.querySelector(".file-upload-area");
      const modeRadios = supp.querySelectorAll(".supp-mode");
      const presetWrap = supp.querySelector(".supp-preset");
      const typeWrap = supp.querySelector(".supp-type-wrap");
      const uploadWrap = supp.querySelector(".supp-upload-wrap");
      const setByType = () => {
        const t = (typeDd?.value || "").toLowerCase();
        const map = {
          pdf: ".pdf",
          word: ".doc,.docx",
          excel: ".xls,.xlsx",
          ppt: ".ppt,.pptx",
          image: ".jpg,.jpeg,.png,.gif",
          video: ".mp4,.mov,.avi",
          link: "",
          text: "",
        };
        if (fileInput)
          fileInput.setAttribute(
            "accept",
            map[t] ||
              ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi"
          );
        if (linkInput)
          linkInput.placeholder =
            t === "link"
              ? "Paste URL (e.g., https://...)"
              : "Paste link or write description";

        const textWrap = supp.querySelector(".supp-text-wrap");
        const uploadWrap = supp.querySelector(".supp-upload-wrap");

        if (textWrap) textWrap.classList.toggle("hidden", t !== "text");
        if (linkInput) linkInput.classList.toggle("hidden", t !== "link");
        if (uploadArea)
          uploadArea.classList.toggle("hidden", t === "link" || t === "text");
        if (uploadWrap) uploadWrap.classList.toggle("hidden", t === "text");
      };
      if (typeDd) {
        typeDd.addEventListener("change", setByType);
        setByType();
      }

      // Supplementary mode: preset vs custom
      if (modeRadios && modeRadios.length) {
        // ensure unique name per block
        const unique = `supp-mode-${Math.random().toString(36).slice(2)}`;
        modeRadios.forEach((r) => (r.name = unique));
        const applyMode = () => {
          const selected =
            Array.from(modeRadios).find((r) => r.checked)?.value || "preset";
          // In custom mode, hide preset category, show type and upload
          const isPreset = selected === "preset";
          if (presetWrap) presetWrap.classList.toggle("hidden", !isPreset);
          if (typeWrap) typeWrap.classList.toggle("hidden", isPreset);
          if (uploadWrap) uploadWrap.classList.toggle("hidden", isPreset);
        };
        modeRadios.forEach((r) => r.addEventListener("change", applyMode));
        applyMode();
      }
    };

    const createRow = () => {
      const row = document.createElement("div");
      row.className = "resource-row resource-card";
      row.innerHTML = `
        <div class="resource-header">
          <div class="title"><span class="icon"><i class="fas fa-book"></i></span><span>Resource</span></div>
          <div class="flex items-center gap-2">
            <select class="resource-type border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select type</option>
              <option value="textbook">Textbook</option>
              <option value="library">Library</option>
              <option value="supplementary">Supplementary</option>
            </select>
            <button type="button" class="remove-resource icon-btn"><i class="fas fa-trash"></i><span>Remove</span></button>
          </div>
        </div>
        <div class="resource-body">
          <div class="resource-content hidden" data-kind="textbook">
            <div>
              <label class="block text-sm text-gray-700 mb-1">Textbook</label>
              <select class="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">Select textbook</option>
                <option>Science Grade 4 (Unit 2)</option>
                <option>English Grammar 1</option>
                <option>Mathematics Workbook A</option>
              </select>
            </div>
          </div>
          <div class="resource-content hidden" data-kind="library">
            <div>
              <label class="block text-sm text-gray-700 mb-1">Library Resource</label>
              <select class="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">Select library item</option>
                <option>Child Encyclopedia Vol. 3</option>
                <option>Atlas for Kids</option>
                <option>Science Experiments 101</option>
              </select>
            </div>
          </div>
          <div class="resource-content hidden" data-kind="supplementary">
            <div class="mb-2">
              <span class="block text-sm text-gray-700 mb-1">How do you want to add this supplementary resource?</span>
              <div class="flex items-center gap-4">
                <label class="text-sm text-gray-700"><input type="radio" class="supp-mode" value="preset" checked> Use a supplementary preset</label>
                <label class="text-sm text-gray-700"><input type="radio" class="supp-mode" value="custom"> I'll choose file type myself</label>
              </div>
              <p class="text-xs text-gray-500 mt-1">Preset lets you tag the resource (e.g., Worksheet, Handout, Slides). Custom lets you only specify the file type.</p>
            </div>
            <div class="supp-preset">
              <label class="block text-sm text-gray-700 mb-1">Supplementary</label>
              <select class="supp-category w-full border border-gray-300 rounded-md px-3 py-2 mb-2">
                <option value="worksheet">Worksheet</option>
                <option value="handout">Handout</option>
                <option value="slides">Slides</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="link">Link</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="supp-type-wrap">
              <label class="block text-sm text-gray-700 mb-1">Type</label>
              <select class="supp-type w-full border border-gray-300 rounded-md px-3 py-2 mb-2">
                <option value="pdf">PDF</option>
                <option value="word">Word</option>
                <option value="excel">Excel</option>
                <option value="ppt">PowerPoint</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="link">Link</option>
                <option value="text">Text</option>
              </select>
            </div>
            <div class="supp-upload-wrap">
              <label class="block text-sm text-gray-700 mb-1">Upload/Link</label>
              <input type="text" class="supp-link w-full border border-gray-300 rounded-md px-3 py-2 mb-2" placeholder="Paste link or write description">
              <div class="file-upload-area border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 transition-colors">
                <i class="fas fa-cloud-upload-alt text-gray-400 mb-1"></i>
                <p class="text-sm text-gray-500">Drag files here or click to browse</p>
                <input type="file" class="supp-file hidden" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi">
              </div>
            </div>
            <div class="supp-text-wrap hidden">
              <label class="block text-sm text-gray-700 mb-1">Text Content</label>
              <textarea class="w-full border border-gray-300 rounded-md px-3 py-2 h-24" placeholder="Write the text content here..."></textarea>
            </div>
          </div>
        </div>
      `;

      const typeSelect = row.querySelector(".resource-type");
      const apply = () => {
        row
          .querySelectorAll(".resource-content")
          .forEach((c) => c.classList.add("hidden"));
        const val = (typeSelect ? typeSelect.value : "").toLowerCase().trim();
        if (val) {
          const active = row.querySelector(
            `.resource-content[data-kind="${val}"]`
          );
          if (active) active.classList.remove("hidden");
          if (val === "supplementary") {
            const cat = active.querySelector(".supp-category");
            if (cat) cat.focus();
          }
        }
      };
      typeSelect.addEventListener("change", apply);
      apply();

      row
        .querySelectorAll('.resource-content[data-kind="supplementary"]')
        .forEach((supp) => wireSupplementary(supp));

      const removeBtn = row.querySelector(".remove-resource");
      removeBtn.addEventListener("click", () => row.remove());

      // Enable DnD on newly inserted upload areas
      setupDragAndDrop();

      return row;
    };

    if (addBtn && list) {
      addBtn.addEventListener("click", () => {
        list.appendChild(createRow());
      });
      if (list.children.length === 0) {
        list.appendChild(createRow());
      }
    } else {
      wireSingle();
    }

    // Mark as initialized to prevent duplicate event bindings
    block.dataset.resourcesInitialized = "true";
  });

  setupDragAndDrop();
}

function loadInstructionalSequence() {
  const container = document.getElementById("instructional-sequence");
  container.innerHTML = `
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-chalkboard-teacher mr-2"></i>Instructional Sequence
            </h2>
            
            <div class="mb-8 border-l-4 border-blue-500 pl-4">
                <h3 class="text-lg font-medium text-gray-800 mb-4">1. Anticipation</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Hook Activity</label>
                        <textarea class="w-full border border-gray-300 rounded-md px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe how you will engage students..."></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Recap Activity</label>
                        <textarea class="w-full border border-gray-300 rounded-md px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe recap activity..."></textarea>
                    </div>
                </div>
                <div class="mt-4 resource-block" data-section="anticipation">
                    <h4 class="font-medium text-gray-800 mb-2"><i class="fas fa-book mr-2"></i>Resources & Materials</h4>
                    <div class="resource-list space-y-4"></div>
                    <div class="flex justify-end mt-3">
                      <button type="button" class="add-resource bg-blue-50 text-blue-600 px-4 py-2 rounded hover:bg-blue-100">Add Resource</button>
                    </div>
                </div>
            </div>

            <div class="mb-8 border-l-4 border-green-500 pl-4">
                <h3 class="text-lg font-medium text-gray-800 mb-4">2. Building Knowledge</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Name of Main Activity</label>
                        <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter activity name">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description of Activity</label>
                        <textarea class="w-full border border-gray-300 rounded-md px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Explain how the activity will be conducted..."></textarea>
                    </div>
                    
                    <div class="resource-block" data-section="building">
                        <h4 class="font-medium text-gray-800 mb-2"><i class="fas fa-book mr-2"></i>Resources & Materials</h4>
                        <div class="resource-list space-y-4"></div>
                        <div class="flex justify-end mt-3">
                          <button type="button" class="add-resource bg-blue-50 text-blue-600 px-4 py-2 rounded hover:bg-blue-100">Add Resource</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mb-8 border-l-4 border-purple-500 pl-4">
                <h3 class="text-lg font-medium text-gray-800 mb-4">3. Consolidation</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Name of Consolidation Activity</label>
                        <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter consolidation activity name">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Description of Activity</label>
                        <textarea class="w-full border border-gray-300 rounded-md px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe consolidation activity..."></textarea>
                    </div>
                    
                    <div class="resource-block" data-section="consolidation">
                        <h4 class="font-medium text-gray-800 mb-2"><i class="fas fa-book mr-2"></i>Resources & Materials</h4>
                        <div class="resource-list space-y-4"></div>
                        <div class="flex justify-end mt-3">
                          <button type="button" class="add-resource bg-blue-50 text-blue-600 px-4 py-2 rounded hover:bg-blue-100">Add Resource</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
  setupResourceBlocks();
}

function loadAssessmentSection() {
  const container = document.getElementById("assessment-section");
  container.innerHTML = `
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-clipboard-list mr-2"></i>Assessment
            </h2>
            <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Type of Assessment</label>
                        <select class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select Assessment Type</option>
                            <option value="formative">Formative Assessment</option>
                            <option value="summative">Summative Assessment</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Timeline of Assessment</label>
                        <input type="date" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Description of Assessment</label>
                    <textarea class="w-full border border-gray-300 rounded-md px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe assessment method..."></textarea>
                </div>
                <div class="resource-block" data-section="assessment">
                    <h4 class="font-medium text-gray-800 mb-2"><i class="fas fa-book mr-2"></i>Resources & Materials</h4>
                    <div class="resource-list space-y-4"></div>
                    <div class="flex justify-end mt-3">
                      <button type="button" class="add-resource bg-blue-50 text-blue-600 px-4 py-2 rounded hover:bg-blue-100">Add Resource</button>
                    </div>
                </div>
                <div class="flex space-x-4">
                    <button type="button" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onclick="openAssessmentBank()">
                        <i class="fas fa-plus mr-2"></i>Add from Assessment Bank
                    </button>
                </div>
            </div>
        </div>
    `;
  setupResourceBlocks();
}

function loadHomeworkSection() {
  const container = document.getElementById("homework-section");
  container.innerHTML = `
        <div class="bg-white rounded-lg shadow-md p-6 mt-4">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">
                <i class="fas fa-home mr-2"></i>Homework Assignment
            </h2>
            <div class="space-y-4">
                <div class="homework-list space-y-4"></div>
                <div class="flex justify-end">
                  <button type="button" class="add-homework bg-blue-50 text-blue-600 px-4 py-2 rounded hover:bg-blue-100">
                    Add Homework
                  </button>
                </div>
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p class="text-sm text-yellow-800">
                        <i class="fas fa-info-circle mr-2"></i>
                        Note: Homework will only be assigned after lesson is conducted.
                    </p>
                </div>
            </div>
        </div>
    `;
  setupHomeworkList();
}

function setupHomeworkList() {
  const root = document.getElementById("homework-section");
  if (!root) return;
  const wrapper = root.querySelector(".bg-white");
  if (!wrapper || wrapper.dataset.hwInitialized === "true") return;

  const list = root.querySelector(".homework-list");
  const addBtn = root.querySelector(".add-homework");

  const createRow = () => {
    const row = document.createElement("div");
    row.className = "homework-row resource-card";
    row.innerHTML = `
      <div class="resource-header">
        <div class="title"><span class="icon"><i class="fas fa-tasks"></i></span><span>Homework</span></div>
        <button type="button" class="remove-hw icon-btn"><i class="fas fa-trash"></i><span>Remove</span></button>
      </div>
      <div class="resource-body">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Homework Title</label>
          <input type="text" class="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Enter homework title">
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea class="w-full border border-gray-300 rounded-md px-3 py-2 h-20" placeholder="Describe homework assignment..."></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
          <input type="date" class="w-full border border-gray-300 rounded-md px-3 py-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Estimated Time (minutes)</label>
          <input type="number" class="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="30">
        </div>
      </div>
    `;

    row
      .querySelector(".remove-hw")
      .addEventListener("click", () => row.remove());
    return row;
  };

  if (addBtn && list) {
    addBtn.addEventListener("click", () => {
      list.appendChild(createRow());
    });
    // start with one row
    if (list.children.length === 0) list.appendChild(createRow());
  }

  wrapper.dataset.hwInitialized = "true";
}

// Reflection section removed per requirements

function setupDragAndDrop() {
  document.querySelectorAll(".file-upload-area").forEach((area) => {
    const input = area.querySelector('input[type="file"]');
    const button = area.querySelector("button");

    if (button) {
      button.addEventListener("click", () => input.click());
    }
    area.addEventListener("click", () => input.click());

    area.addEventListener("dragover", (e) => {
      e.preventDefault();
      area.classList.add("drag-over");
    });

    area.addEventListener("dragleave", () => {
      area.classList.remove("drag-over");
    });

    area.addEventListener("drop", (e) => {
      e.preventDefault();
      area.classList.remove("drag-over");
      const files = e.dataTransfer.files;
      handleFileUpload(files, area.dataset.section);
    });

    input.addEventListener("change", (e) => {
      handleFileUpload(e.target.files, area.dataset.section);
    });
  });
}

function handleFileUpload(files, section) {
  const container =
    document.getElementById(`${section}-files`) ||
    document.querySelector(`[data-section="${section}"] .uploaded-files`);

  if (!container) return;

  Array.from(files).forEach((file) => {
    const fileItem = document.createElement("div");
    fileItem.className = "resource-item";
    fileItem.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-file mr-2 text-blue-600"></i>
                <span class="text-sm">${file.name}</span>
                <span class="text-xs text-gray-500 ml-2">(${formatFileSize(
                  file.size
                )})</span>
            </div>
            <button type="button" class="remove-btn" onclick="removeFile(this)">
                <i class="fas fa-times"></i>
            </button>
        `;
    container.appendChild(fileItem);
  });

  showNotification("Files uploaded successfully", "success");
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function removeFile(button) {
  button.closest(".resource-item").remove();
}

function setupStarRating() {
  document.querySelectorAll(".star-rating").forEach((rating) => {
    const stars = rating.querySelectorAll(".fa-star");

    stars.forEach((star) => {
      star.addEventListener("click", function () {
        const starValue = parseInt(this.dataset.star);
        rating.dataset.rating = starValue;

        stars.forEach((s, index) => {
          const isOn = index < starValue;
          s.classList.toggle("active", isOn);
          // Toggle filled vs outlined icon
          s.classList.toggle("fas", isOn);
          s.classList.toggle("far", !isOn);
        });
      });
    });
  });
}

function setupEmojiRating() {
  document.querySelectorAll(".emoji-rating .emoji").forEach((emoji) => {
    emoji.addEventListener("click", function () {
      this.parentElement.querySelectorAll(".emoji").forEach((e) => {
        e.classList.remove("selected");
      });
      this.classList.add("selected");
    });
  });
}

function addResource(type) {
  const container = document.getElementById(`${type}-resources`);
  const resourceItem = document.createElement("div");
  resourceItem.className = "resource-item";
  resourceItem.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-book mr-2 text-blue-600"></i>
            <input type="text" class="flex-1 border-none outline-none bg-transparent" placeholder="Enter resource name...">
        </div>
        <button type="button" class="remove-btn" onclick="removeFile(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
  container.appendChild(resourceItem);
  resourceItem.querySelector("input").focus();
}

function saveDraft() {
  showNotification("Saving draft...", "info");
  const formData = new FormData(document.getElementById("lessonPlanForm"));
  const data = Object.fromEntries(formData.entries());
  localStorage.setItem("lessonPlanData", JSON.stringify(data));
  localStorage.setItem("lastSaved", new Date().toISOString());
  isDirty = false;
  setTimeout(() => {
    showNotification("Draft saved successfully", "success");
  }, 1000);
}

function submitForReview() {
  showNotification("Submitting for review...", "info");
  setTimeout(() => {
    showNotification("Lesson plan submitted for review", "success");
  }, 2000);
}

function markAsConducted() {
  // Reflection removed; just notify
  showNotification("Lesson marked as conducted.", "info");
}

function previewLesson() {
  showNotification("Opening lesson preview...", "info");
}

function validateForm() {
  // Validations removed per requirements
  return true;
}

function updateProgress() {
  const sections = document.querySelectorAll(".bg-white.rounded-lg.shadow-md");
  let completedSections = 0;

  sections.forEach((section) => {
    const inputs = section.querySelectorAll("input, select, textarea");
    let hasContent = false;

    inputs.forEach((input) => {
      if (input.value.trim()) {
        hasContent = true;
      }
    });

    if (hasContent) {
      section.classList.add("section-complete");
      section.classList.remove("section-incomplete");
      completedSections++;
    } else {
      section.classList.add("section-incomplete");
      section.classList.remove("section-complete");
    }
  });

  const progress = (completedSections / sections.length) * 100;
  updateProgressBar(progress);
}

function updateProgressBar(progress) {
  let progressBar = document.querySelector(".progress-bar");
  if (!progressBar) {
    const progressIndicator = document.createElement("div");
    progressIndicator.className = "progress-indicator";
    progressIndicator.innerHTML = '<div class="progress-bar"></div>';
    document.body.prepend(progressIndicator);
    progressBar = document.querySelector(".progress-bar");
  }
  progressBar.style.width = `${progress}%`;
}

function createFloatingSaveButton() {
  const floatingBtn = document.createElement("div");
  floatingBtn.className = "floating-save no-print";
  floatingBtn.innerHTML = '<i class="fas fa-save"></i>';
  floatingBtn.addEventListener("click", saveDraft);
  document.body.appendChild(floatingBtn);
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

function startAutoSave() {
  autoSaveInterval = setInterval(() => {
    if (isDirty) {
      saveDraft();
    }
  }, 30000);
}

function populateForm() {
  Object.keys(lessonPlanData).forEach((key) => {
    const field = document.querySelector(`[name="${key}"]`);
    if (field) {
      field.value = lessonPlanData[key];
    }
  });
}

function openAssessmentBank() {
  showNotification("Opening Assessment Bank...", "info");
}

// Multi-step form functionality
function nextStep() {
  if (currentStep < totalSteps) {
    hideStep(currentStep);
    currentStep++;
    showStep(currentStep);
    updateStepIndicator();
    updateNavigationButtons();
    updateProgressBar();
  }
}

function previousStep() {
  if (currentStep > 1) {
    hideStep(currentStep);
    currentStep--;
    showStep(currentStep);
    updateStepIndicator();
    updateNavigationButtons();
    updateProgressBar();
  }
}

function goToStep(step) {
  if (step >= 1 && step <= totalSteps) {
    hideStep(currentStep);
    currentStep = step;
    showStep(currentStep);
    updateStepIndicator();
    updateNavigationButtons();
    updateProgressBar();
  }
}

function showStep(step) {
  const stepElement = document.getElementById(`step-${step}`);
  if (stepElement) {
    stepElement.classList.add("active");
    stepElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function hideStep(step) {
  const stepElement = document.getElementById(`step-${step}`);
  if (stepElement) {
    stepElement.classList.remove("active");
  }
}

function updateStepIndicator() {
  // Update step counter
  document.getElementById("current-step").textContent = currentStep;
  document.getElementById("total-steps").textContent = totalSteps;

  // Update step indicators
  document.querySelectorAll(".step-indicator").forEach((indicator, index) => {
    const stepNumber = index + 1;
    indicator.classList.remove("active", "completed");

    if (stepNumber < currentStep) {
      indicator.classList.add("completed");
      const icon = indicator.querySelector(".step-circle i");
      if (icon) {
        icon.className = "fas fa-check";
      }
    } else if (stepNumber === currentStep) {
      indicator.classList.add("active");
    }
  });

  // Update connectors
  document.querySelectorAll(".step-connector").forEach((connector, index) => {
    const stepNumber = index + 1;
    if (stepNumber < currentStep) {
      connector.classList.add("completed");
    } else {
      connector.classList.remove("completed");
    }
  });
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const submitBtn = document.getElementById("submit-btn");

  // Previous button
  if (prevBtn) {
    prevBtn.disabled = currentStep === 1;
  }

  // Next/Submit buttons
  if (currentStep === totalSteps) {
    if (nextBtn) nextBtn.classList.add("hidden");
    if (submitBtn) submitBtn.classList.remove("hidden");
  } else {
    if (nextBtn) nextBtn.classList.remove("hidden");
    if (submitBtn) submitBtn.classList.add("hidden");
  }
}

function updateProgressBar() {
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    const progress = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${progress}%`;
  }
}

function validateCurrentStep() {
  return true;
}

// Add click handlers for step indicators
function initStepIndicators() {
  document.querySelectorAll(".step-indicator").forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      const targetStep = index + 1;
      // Allow navigation to completed steps or current step
      if (
        targetStep <= currentStep ||
        indicator.classList.contains("completed")
      ) {
        goToStep(targetStep);
      }
    });

    // Add cursor pointer for clickable steps
    indicator.style.cursor = "pointer";
  });
}

window.addEventListener("beforeunload", () => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
});
