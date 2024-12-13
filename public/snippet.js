export function updateFrameworkText() {
  const frameworkButton = this.$refs.frameworkButton;
  let snippetContent = "";

  if (this.activeFramework === "bootstrap") {
    frameworkButton.innerText = "Bootstrap";
    snippetContent = this.bootstrapLinks.snippet;
  } else if (this.activeFramework === "bulma") {
    frameworkButton.innerText = "Bulma";
    snippetContent = this.bulmaLinks.snippet;
  } else {
    frameworkButton.innerText = "N8T8N";
    snippetContent = "";
  }

  // Fetch the snippet content and update the dropdown menu
  if (snippetContent) {
    fetch(snippetContent)
      .then((response) => response.json())
      .then((data) => {
        // Assuming the JSON structure is as provided
        const dropdownMenu = document.createElement("div");
        dropdownMenu.className = "dropdown-menu";
        dropdownMenu.style.display = "none";
        dropdownMenu.style.flexDirection = "column";

        // Recursive function to generate buttons
        const generateButtons = (obj, parentElement) => {
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              const button = document.createElement("button");
              button.className = "dropdown-menu-item";
              button.innerText = `Add ${
                key.charAt(0).toUpperCase() + key.slice(1)
              }`;

              if (typeof obj[key] === "string") {
                // If the value is a string, add a click event to insert the component
                button.addEventListener("click", () => {
                  const formattedHtml = obj[key].replace(/(<[^>]+>)/g, "$1\n");
                  const cursorPosition = this.editor.getCursorPosition();
                  this.editor.session.insert(cursorPosition, formattedHtml);
                  this.closeConfigModal();
                  dropdownMenu.style.display = "none";
                });
              } else if (typeof obj[key] === "object") {
                // If the value is an object, create a nested dropdown
                button.innerText = `+ ${
                  key.charAt(0).toUpperCase() + key.slice(1)
                }`;
                const subMenu = document.createElement("div");
                subMenu.className = "sub-dropdown-menu";
                subMenu.style.display = "none"; // Hide sub-menu by default
                generateButtons(obj[key], subMenu);
                parentElement.appendChild(subMenu);

                // Add click event listener to show/hide the sub-menu
                button.addEventListener("click", (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  // Hide all sub-menus before showing the current one
                  const subMenus =
                    dropdownMenu.querySelectorAll(".sub-dropdown-menu");
                  subMenus.forEach((subMenu) => {
                    subMenu.style.display = "none";
                  });
                  if (subMenu.style.display === "none") {
                    subMenu.style.display = "flex";
                  } else {
                    subMenu.style.display = "none";
                  }
                });
              }

              parentElement.appendChild(button);
            }
          }
        };

        generateButtons(data.components, dropdownMenu);

        // Clear existing dropdown menu and append the new one
        frameworkButton.innerHTML = frameworkButton.innerText;
        frameworkButton.appendChild(dropdownMenu);

        // Add click event listener to show/hide the dropdown menu
        frameworkButton.addEventListener("click", () => {
          if (dropdownMenu.style.display === "none") {
            dropdownMenu.style.display = "flex";
            // Hide all sub-menus when main menu is opened
            const subMenus =
              dropdownMenu.querySelectorAll(".sub-dropdown-menu");
            subMenus.forEach((subMenu) => {
              subMenu.style.display = "none";
            });
          } else {
            dropdownMenu.style.display = "none";
          }
        });

        // Add click event listener to close the dropdown when clicking on a sub-dropdown item
        document.addEventListener("click", (event) => {
          if (
            event.target.classList.contains("sub-dropdown-menu") ||
            event.target.classList.contains("dropdown-item")
          ) {
            dropdownMenu.style.display = "none";
          }
        });

        // Add click event listener to close the dropdown when clicking outside
        document.addEventListener("click", (event) => {
          if (
            !dropdownMenu.contains(event.target) &&
            event.target !== frameworkButton
          ) {
            dropdownMenu.style.display = "none";
          }
        });
      })
      .catch((error) => {
        console.error("Error loading snippet content:", error);
      });
  } else {
    // Clear existing dropdown menu
    frameworkButton.innerHTML = frameworkButton.innerText;
  }

  this.updatePreview();
}
