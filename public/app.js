import { updateFrameworkText } from "./snippet.js";
export default {
  updatePreview() {
    try {
      const iframe = document.createElement("iframe");
      let content = this.editor.getValue();

      const addStyle = (url) => `<link rel="stylesheet" href="${url}">`;
      const addScript = (url) => `<script src="${url}"><\/script>`;

      // Inject styles into the <head>
      const injectStyles = (urls) => {
        const styles = urls.map(addStyle).join("\n");
        if (content.includes("<head>")) {
          content = content.replace(/<head>/i, `<head>\n${styles}`);
        } else {
          content = `<!DOCTYPE html>\n<html>\n<head>\n${styles}\n</head>\n<body>\n${content}\n</body>\n</html>`;
        }
      };

      // Inject scripts into the <head> below styles
      const injectScriptsInHead = (urls) => {
        const scripts = urls.map(addScript).join("\n");
        if (content.includes("</head>")) {
          content = content.replace(/<\/head>/i, `${scripts}\n</head>`);
        } else {
          content = `<!DOCTYPE html>\n<html>\n<head>\n${scripts}\n</head>\n<body>\n${content}\n</body>\n</html>`;
        }
      };

      // Remove existing styles or scripts
      const removeAssets = (urls) => {
        urls.forEach((url) => {
          const regex = new RegExp(
            `<link rel="stylesheet" href="${url}">|<script src="${url}"><\/script>`,
            "gi"
          );
          content = content.replace(regex, "");
        });
      };

      // Handle Bootstrap
      if (this.activeFramework === "bootstrap") {
        injectStyles([this.bootstrapLinks.css]);
        injectScriptsInHead([this.bootstrapLinks.pop, this.bootstrapLinks.js]);
        setTimeout(() => this.closeConfigModal(), 888);
      } else {
        removeAssets([
          this.bootstrapLinks.css,
          this.bootstrapLinks.pop,
          this.bootstrapLinks.js,
        ]);
      }

      // Handle Bulma
      if (this.activeFramework === "bulma") {
        injectStyles([this.bulmaLinks.css]);
        setTimeout(() => this.closeConfigModal(), 888);
      } else {
        removeAssets([this.bulmaLinks.css]);
      }

      // Inject external URLs
      const externalUrls = this.addedUrls.filter((url) => url.trim() !== "");
      const externalStyles = externalUrls.filter((url) => url.endsWith(".css"));
      const externalScripts = externalUrls.filter((url) => url.endsWith(".js"));

      injectStyles(externalStyles);
      injectScriptsInHead(externalScripts);

      // Ensure valid HTML structure
      if (!content.includes("<!DOCTYPE html>")) {
        content = `<!DOCTYPE html>\n<html>\n<head></head>\n<body>\n${content}\n</body>\n</html>`;
      }

      // Set iframe content
      iframe.srcdoc = content;
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";

      // Update the preview
      this.$refs.preview.innerHTML = "";
      this.$refs.preview.appendChild(iframe);
    } catch (error) {
      console.error("Error updating preview:", error);
    }
  },

  updateFrameworkButton() {
    const buttons = document.querySelectorAll(".config-btn");
    buttons.forEach((button) => {
      button.classList.remove("active", "inactive");

      if (
        this.activeFramework === "bootstrap" &&
        button.textContent.includes("Bootstrap")
      ) {
        button.classList.add("active");
      } else if (
        this.activeFramework === "bulma" &&
        button.textContent.includes("Bulma")
      ) {
        button.classList.add("active");
      } else {
        button.classList.add("inactive");
      }
    });
  },

  updateFrameworkText,

  toggleWrap() {
    this.wrapEnabled = !this.wrapEnabled;
    this.editor.setOption("wrap", this.wrapEnabled);
  },

  toggleFontSize() {
    this.fontSize = this.fontSize === 14 ? 18 : 14;
    this.editor.setOption("fontSize", this.fontSize);
  },

  openConfigModal() {
    this.showConfigModal = true;
    this.$nextTick(() => {
      document.querySelector(".modal-content").classList.add("show");
    });
  },

  closeConfigModal() {
    document.querySelector(".modal-content").classList.remove("show");
    setTimeout(() => {
      this.showConfigModal = false;
    }, 300);
  },

  loadSampleCode() {
    try {
      fetch("sample.html")
        .then((response) => response.text())
        .then((data) => {
          this.editor.setValue(data, 1);
          setTimeout(() => this.closeConfigModal(), 888);
        });
    } catch (error) {
      console.error("Error loading sample code:", error);
    }
  },

  toggleUrlInput() {
    this.showUrlInput = !this.showUrlInput;
  },

  addUrlPair() {
    this.urlPairs.push({ cssUrl: "", jsUrl: "" });
  },

  removeUrlPair(index) {
    this.urlPairs.splice(index, 1);
    this.updateAddedUrls();
  },

  updateAddedUrls() {
    this.addedUrls = [];
    this.urlPairs.forEach((pair) => {
      if (pair.cssUrl.trim() !== "") {
        this.addedUrls.push(pair.cssUrl);
      }
      if (pair.jsUrl.trim() !== "") {
        this.addedUrls.push(pair.jsUrl);
      }
    });
    this.updatePreview();
  },

  getUrlPlaceholder(url) {
    if (url.endsWith(".css")) {
      return "CSS URL";
    } else if (url.endsWith(".js")) {
      return "JS URL";
    } else {
      return "URL";
    }
  },

  addEventListeners() {
    window.addEventListener("mousemove", this.resize);
    window.addEventListener("mouseup", this.stopResize);
    window.addEventListener("touchmove", this.resize, { passive: false });
    window.addEventListener("touchend", this.stopResize);
    window.addEventListener("resize", this.handleWindowResize);
  },

  removeEventListeners() {
    window.removeEventListener("mousemove", this.resize);
    window.removeEventListener("mouseup", this.stopResize);
    window.removeEventListener("touchmove", this.resize);
    window.removeEventListener("touchend", this.stopResize);
    window.removeEventListener("resize", this.handleWindowResize);
  },

  startResize(e) {
    e.preventDefault();
    this.isResizing = true;
    this.initialX = e.clientX || (e.touches && e.touches[0].clientX);
    this.initialY = e.clientY || (e.touches && e.touches[0].clientY);
  },

  resize(e) {
    if (!this.isResizing) return;
    e.preventDefault();

    const currentX = e.clientX || (e.touches && e.touches[0].clientX);
    const currentY = e.clientY || (e.touches && e.touches[0].clientY);
    const deltaX = currentX - this.initialX;
    const deltaY = currentY - this.initialY;

    if (window.innerWidth <= 500) {
      this.previewHeight = Math.max(
        20,
        Math.min(80, this.previewHeight - (deltaY / window.innerHeight) * 100)
      );
      this.editorWidth = 100; // Ensure editor width is 100% on small screens
    } else {
      this.editorWidth = Math.max(
        20,
        Math.min(80, this.editorWidth + (deltaX / window.innerWidth) * 100)
      );
    }

    this.initialX = currentX;
    this.initialY = currentY;

    this.updateSizes();
  },

  stopResize() {
    this.isResizing = false;
  },

  handleWindowResize() {
    if (window.innerWidth <= 500) {
      this.editorWidth = 100;
      this.previewHeight = 50;
    } else {
      this.editorWidth = 50;
      this.editorHeight = 100;
    }
    this.updateSizes();
  },

  updateSizes() {
    if (window.innerWidth <= 500) {
      document.getElementById("editor").style.width = `${this.editorWidth}%`;
      document.getElementById("preview").style.width = `${this.editorWidth}%`; // Adjusted to match editor width
      document.getElementById("editor").style.height = `${
        100 - this.previewHeight
      }%`;
      document.getElementById(
        "preview"
      ).style.height = `${this.previewHeight}%`;
    } else {
      document.getElementById("editor").style.width = `${this.editorWidth}%`;
      document.getElementById("preview").style.width = `${
        100 - this.editorWidth
      }%`;
      document.getElementById("editor").style.height = `${this.editorHeight}%`;
      document.getElementById("preview").style.height = `${this.editorHeight}%`;
    }
  },
};
