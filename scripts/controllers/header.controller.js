export const headerLinkHandle = () => {
  const headerLinkEls = document.querySelectorAll(".header_nav li");
  const headerAanchorEls = document.querySelectorAll(".header_nav a");

  headerAanchorEls.forEach((headerAanchorEl, i) => {
    headerAanchorEl.addEventListener("mouseover", () => {
      headerLinkEls[i].style.borderBottom = "3px solid #FB8C00";
    });
    headerAanchorEl.addEventListener("mouseout", () => {
      headerLinkEls[i].style.borderBottom = "3px solid transparent";
    });
  });
};

export const headerInputHandle = () => {
  const inputEl = document.querySelector(".header .input");
  const searchEl = document.querySelector(".search");
  searchEl.addEventListener("click", () => {
    inputEl.classList.toggle("active");
  });
};

export const headerHamburgerHandle = () => {
  const hamburgerEl = document.querySelector("header .hamburger");
  const headerNavEl = document.querySelector(".header_nav");
  hamburgerEl.addEventListener("click", () => {
    headerNavEl.classList.toggle("active");

    hamburgerEl.classList.toggle("active");
  });
};
