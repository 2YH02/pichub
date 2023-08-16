import { generateUser, getProfileImg, listAlbums } from "../../s3/viewUserData";
import { generateProfilePage } from "../view/create-profile-page";

export async function searchByUser() {
  const searchEls = document.querySelectorAll("header input");
  let data;

  try {
    data = await getUserData();
  } catch (err) {
    console.log(err);
  }

  searchEls.forEach((searchEl) => {
    searchEl.addEventListener("input", (e) => {
      const filter = data.filter((v) => v.name.includes(e.target.value));

      const editProfilePage = document.getElementById("edit-profile-page");
      const profilePage = document.getElementById("profile-page");
      const createUser = document.getElementById("create-user");
      const s3Viewer = document.getElementById("s3");

      if (editProfilePage.style.display !== "none") {
        editProfilePage.style.display = "none";
      }
      if (profilePage.style.display !== "none") {
        profilePage.style.display = "none";
      }
      if (createUser.style.display !== "none") {
        createUser.style.display = "none";
      }
      if (s3Viewer.style.display === "none") {
        s3Viewer.style.display = "block";
      }

      generateUser();

      filter.forEach(async (v) => {
        const ProfileImg = await getProfileImg(v.id);

        users.appendChild(listSearchUser(v, ProfileImg));
      });
      // console.log(filter);
    });
  });
}

function getUserData() {
  const userJson = import.meta.env.VITE_USER_JSON;
  return new Promise((res, rej) => {
    fetch(userJson)
      .then((res) => res.json())
      .then((data) => {
        res(data);
      })
      .catch((error) => {
        rej("Error:", error);
      });
  });
}

function listSearchUser(user, profileImg) {
  const userBox = document.createElement("div");

  const imgWrap = document.createElement("div");
  const infoWrap = document.createElement("div");

  const userBtnWrap = document.createElement("div");

  const img = document.createElement("img");
  const name = document.createElement("div");
  const nation = document.createElement("div");
  const pn = document.createElement("div");
  const email = document.createElement("div");

  const albumBtn = document.createElement("div");
  const profileBtn = document.createElement("div");

  img.src = profileImg;
  name.textContent = user.name;
  nation.textContent = user.nation;
  pn.textContent = user.phon;
  email.textContent = user.email;

  albumBtn.textContent = "Go to Album";
  albumBtn.classList.add("btn");
  profileBtn.textContent = "Go to Profile";
  profileBtn.classList.add("btn-reverse");

  userBtnWrap.append(albumBtn, profileBtn);

  imgWrap.append(img);
  infoWrap.append(name, nation, pn, email, userBtnWrap);

  userBox.append(imgWrap, infoWrap);
  albumBtn.addEventListener("click", () => {
    listAlbums(user.id);
  });

  profileBtn.addEventListener("click", () => {
    const profilePage = document.getElementById("profile-page");
    const s3Viewer = document.getElementById("s3");

    s3Viewer.style.display = "none";
    profilePage.innerHTML = "";
    profilePage.style.display = "block";
    profilePage.append(generateProfilePage(user.id));
  });

  return userBox;
}
