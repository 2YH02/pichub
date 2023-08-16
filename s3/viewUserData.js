import { generateProfilePage } from "../scripts/view/create-profile-page";
import { generateAlbumModal } from "../scripts/view/create-album-modal";
import { deleteUserAlbum } from "./handleUserData";

let albumBucketName = import.meta.env.VITE_BUCKET_NAME;

AWS.config.region = import.meta.env.VITE_REGION;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
});

let s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName },
});

function generateAlbumBtn(userName, profileImg, data) {
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

  if (data.length > 0) {
    const user = data.find((v) => v.id === userName);

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
  }

  albumBtn.addEventListener("click", () => {
    listAlbums(userName);
  });

  profileBtn.addEventListener("click", () => {
    const profilePage = document.getElementById("profile-page");
    const s3Viewer = document.getElementById("s3");

    s3Viewer.style.display = "none";
    profilePage.innerHTML = "";
    profilePage.style.display = "block";
    profilePage.append(generateProfilePage(userName));
  });

  return userBox;
}

export function generateUser() {
  const listTitle = document.getElementById("list-title");
  listTitle.textContent = "User lists";

  const getBackBtn = document.getElementsByClassName("buttonWrap");
  const backBtns = [...getBackBtn];

  backBtns.forEach((backBtn) => {
    backBtn.innerHTML = "";
    backBtn.display = "none";
    backBtn.classList.remove("btn");
  });

  const images = document.getElementById("images");
  const viewer = document.getElementById("viewer");

  images.innerHTML = "";

  if (images.style.display !== "none") {
    images.style.display = "none";
  }
  if (viewer.style.display !== "none") {
    viewer.style.display = "none";
  }

  const users = document.getElementById("users");

  users.innerHTML = "";

  if (users.style.display === "none") {
    users.style.display = "flex";
  }
}

function generateAlbumImg(album, userName, albumName) {
  s3.listObjects(
    { Prefix: userName + "/" + albumName + "/" },
    function (err, data) {
      if (err) {
        return alert("앨범 메인 이미지 로딩 오류: " + err.message);
      } else {
        // console.log(data);
        let href = this.request.httpRequest.endpoint.href;
        let bucketUrl = href + albumBucketName + "/";
        if (!data.Contents[1]) {
          album.style.backgroundImage = "url('./images/album.png')";
        } else {
          let photoKey = data.Contents[1].Key;
          let photoUrl = bucketUrl + encodeURIComponent(photoKey);
          album.style.backgroundImage = `url(${photoUrl})`;
        }
      }
    }
  );
}

export function listUsers() {
  generateUser();
  const userJson = import.meta.env.VITE_USER_JSON;
  fetch(userJson)
    .then((res) => res.json())
    .then(async (data) => {
      // console.log(data);
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
      // debugger;

      const userElements = await Promise.all(
        data.map(async (v) => {
          const ProfileImg = await getProfileImg(v.id);
          return generateAlbumBtn(v.id, ProfileImg, data);
        })
      );

      userElements.forEach((e) => {
        users.appendChild(e);
      });
    })
    .catch((error) => {
      console.error("에러:", error);
    });
}

export async function listSearchUsers(data) {
  generateUser();
  // console.log(data);
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
  // debugger;

  const userElements = await Promise.all(
    data.map(async (v) => {
      const ProfileImg = await getProfileImg(v.id);
      return generateAlbumBtn(v.id, ProfileImg, data);
    })
  );

  userElements.forEach((e) => {
    users.appendChild(e);
  });
}

export async function listAlbums(userName) {
  let albumPhotosKey = encodeURIComponent(userName) + "/";
  await s3.listObjectsV2(
    { Prefix: albumPhotosKey, Delimiter: "/" },
    function (err, data) {
      if (err) {
        return alert("앨범 목록 생성 오류: " + err.message);
      } else {
        const listTitle = document.getElementById("list-title");
        listTitle.textContent = "Album lists";

        const getBackBtn = document.getElementsByClassName("buttonWrap");
        const backBtns = [...getBackBtn];

        backBtns.forEach((backBtn) => {
          backBtn.innerHTML = "";
          backBtn.display = "none";
          backBtn.classList.add("btn");
          backBtn.style.marginLeft = "auto";
          backBtn.style.marginRight = "auto";

          const backToUserBtn = document.createElement("div");

          backToUserBtn.textContent = "back To User";

          backBtn.append(backToUserBtn);

          backToUserBtn.addEventListener("click", () => {
            listUsers();
          });
        });

        const images = document.getElementById("images");
        const usersEl = document.getElementById("users");
        const viewer = document.getElementById("viewer");

        usersEl.innerHTML = "";
        viewer.innerHTML = "";
        images.innerHTML = "";

        if (usersEl.style.display !== "none") {
          usersEl.style.display = "none";
        }
        if (images.style.display !== "none") {
          images.style.display = "none";
        }
        if (viewer.style.display === "none") {
          viewer.style.display = "grid";
        }

        // console.log(data.Contents[1]);
        data.CommonPrefixes.forEach((commonPrefixe) => {
          const albumName = commonPrefixe.Prefix.split("/")[1];
          const album = document.createElement("div");
          const title = document.createElement("div");

          generateAlbumImg(album, userName, albumName);

          title.textContent = albumName;

          album.append(title);

          album.addEventListener("click", () => {
            viewAlbum(userName, albumName);
            // console.log(albumName);
          });

          viewer.appendChild(album);

          // console.log(commonPrefixe);
        });
        const addAlbumBtn = document.createElement("div");

        addAlbumBtn.classList.add("add-album-btn");
        addAlbumBtn.textContent = "Adding a new Album";

        addAlbumBtn.addEventListener("click", () => {
          const createAlbum = document.getElementById("create-album");

          createAlbum.style.display = "block";
          createAlbum.append(generateAlbumModal(userName));
        });

        viewer.appendChild(addAlbumBtn);
      }
    }
  );
}

export function viewAlbum(userName, albumName) {
  s3.listObjectsV2(
    {
      Prefix: userName + "/" + albumName + "/",
    },
    function (err, data) {
      if (err) {
        return alert("이미지 로딩 오류: " + err.message);
      } else {
        const listTitle = document.getElementById("list-title");
        listTitle.textContent = "Photo lists";

        const getBackBtn = document.getElementsByClassName("buttonWrap");

        getBackBtn.innerHTML = "";

        const backBtns = [...getBackBtn];

        backBtns.forEach((backBtn) => {
          backBtn.innerHTML = "";
          backBtn.display = "none";

          backBtn.style.width = "155px";
          backBtn.style.marginTop = "30px";

          const backToAlbumBtn = document.createElement("div");

          backToAlbumBtn.textContent = "back To Albums";

          backBtn.append(backToAlbumBtn);

          backToAlbumBtn.addEventListener("click", () => {
            listAlbums(userName);
          });
        });

        // console.log(data.Contents);
        let href = this.request.httpRequest.endpoint.href;
        let bucketUrl = href + albumBucketName + "/";

        const viewer = document.getElementById("viewer");
        const images = document.getElementById("images");

        images.innerHTML = "";

        if (images.style.display === "none") {
          images.style.display = "grid";
        }
        if (viewer.style.display !== "none") {
          viewer.style.display = "none";
        }

        data.Contents.forEach((content) => {
          let photoKey = content.Key;
          let photoUrl = bucketUrl + encodeURIComponent(photoKey);

          const imgEl = document.createElement("img");
          const imgWrap = document.createElement("div");

          const imgBtnWrap = document.createElement("div");
          const editBtn = document.createElement("div");
          const downBtn = document.createElement("div");

          editBtn.textContent = "Edit";
          editBtn.style.width = "80px";
          editBtn.style.margin = "6px";
          editBtn.style.fontWeight = "bold";
          editBtn.classList.add("btn-reverse");

          downBtn.textContent = "Delete";
          downBtn.style.width = "80px";
          downBtn.style.margin = "6px";
          downBtn.style.fontWeight = "bold";
          downBtn.classList.add("btn");

          downBtn.addEventListener("click", async (e) => {
            const imgArr = photoKey.split("/");
            const n = imgArr.length;
            const img = imgArr[n - 1];

            await deleteImg(userName, albumName, img);

            viewAlbum(userName, albumName);
          });

          imgBtnWrap.style.display = "flex";
          imgBtnWrap.style.alignItems = "center";
          imgBtnWrap.style.justifyContent = "center";

          imgBtnWrap.append(editBtn, downBtn);
          imgEl.src = photoUrl;

          imgWrap.append(imgEl, imgBtnWrap);
          images.appendChild(imgWrap);
          // console.log(photoUrl);
        });

        images
          .getElementsByTagName("div")[0]
          .setAttribute("style", "display:none;");

        //  Create input img box
        const inputImgWrap = document.createElement("div");
        const inputImgBtnWrap = document.createElement("div");
        const inputImgBtnAdd = document.createElement("div");
        const inputImgBtnCancel = document.createElement("div");
        const inputImgBox = document.createElement("div");
        const inputImg = document.createElement("input");

        inputImgBtnWrap.classList.add("dp-f", "ai-c", "jc-c");
        inputImgBtnWrap.style.width = "200px";
        inputImgBtnWrap.style.marginTop = "5px";
        inputImgWrap.classList.add("dp-f", "ai-c", "jc-c", "fd-c");

        inputImgBtnAdd.classList.add("btn");
        inputImgBtnAdd.textContent = "Add";
        inputImgBtnAdd.style.width = "80px";
        inputImgBtnAdd.style.margin = "5px";
        inputImgBtnCancel.classList.add("btn-reverse");
        inputImgBtnCancel.textContent = "Cancel";
        inputImgBtnCancel.style.width = "80px";
        inputImgBtnCancel.style.margin = "5px";

        inputImgBtnWrap.append(inputImgBtnAdd, inputImgBtnCancel);

        inputImgBox.classList.add("input-img-box");
        inputImgBox.textContent = "Drag your image";
        inputImg.type = "file";
        inputImg.classList.add("input-img");

        // click input btn event
        inputImgBtnAdd.addEventListener("click", async () => {
          if (inputImg.files.length > 0) {
            const file = inputImg.files[0];
            console.log("이미지 파일:", file);
            await imageUpload(userName, albumName, file.name, file);

            viewAlbum(userName, albumName);
          } else {
            console.log("이미지 선택 안함.");
          }
        });

        inputImgBtnCancel.addEventListener("click", () => {
          inputImgBox.style.backgroundImage = "";
          inputImg.value = "";
        });

        // inputBox drag event
        inputImgBox.addEventListener("dragover", (e) => {
          e.preventDefault();
          inputImgBox.classList.add("active");
        });
        inputImgBox.addEventListener("dragleave", () => {
          inputImgBox.classList.remove("active");
        });
        inputImgBox.addEventListener("drop", (e) => {
          e.preventDefault();
          inputImgBox.classList.remove("active");

          const files = e.dataTransfer.files;
          if (files.length > 0) {
            inputImg.files = files;
          }

          const reader = new FileReader();
          reader.onload = function (e) {
            inputImgBox.style.backgroundImage = `url(${e.target.result})`;
          };
          reader.readAsDataURL(files[0]);
        });

        inputImgBox.append(inputImg);

        inputImgWrap.append(inputImgBox, inputImgBtnWrap);

        const deleteAlbumBtn = document.createElement("div");

        deleteAlbumBtn.classList.add("delete-user-album");
        deleteAlbumBtn.textContent = "Delete Album";

        deleteAlbumBtn.addEventListener("click", async () => {
          await deleteUserAlbum(albumName, userName);

          listAlbums(userName);

          console.log("1");
        });

        images.appendChild(inputImgWrap);
        images.appendChild(deleteAlbumBtn);
      }
    }
  );
}

function imageUpload(userName, albumName, img, file) {
  return new Promise((res, rej) => {
    s3.upload(
      {
        Key: userName + "/" + albumName + "/" + img,
        Body: file,
      },
      (err, data) => {
        if (err) {
          rej("이미지 업로드 오류:", err);
        } else {
          res("업로드 성공:", data.Location);
        }
      }
    );
  });
}

function deleteImg(userName, albumName, img) {
  return new Promise((res, rej) => {
    s3.deleteObject(
      {
        Key: userName + "/" + albumName + "/" + img,
      },
      (err, data) => {
        if (err) {
          rej("이미지 삭제 오류:", err);
        } else {
          res("삭제 성공");
        }
      }
    );
  });
}

export async function getProfileImg(userName) {
  return new Promise((res, rej) => {
    let albumPhotosKey = encodeURIComponent(userName) + "/";
    s3.listObjectsV2(
      { Prefix: albumPhotosKey, Delimiter: "/" },
      function (err, data) {
        if (err) {
          rej("프로필 출력 오류: " + err.message);
        } else {
          if (!data.Contents[1]) {
            res("./images/user.png");
          } else {
            let href = this.request.httpRequest.endpoint.href;
            let bucketUrl = href + albumBucketName + "/";
            let photoKey = data.Contents[1].Key;
            let photoUrl = bucketUrl + encodeURIComponent(photoKey);
            res(photoUrl);
          }
        }
      }
    );
  });
}

export function profileUpload(userName, file, img) {
  return new Promise((res, rej) => {
    s3.upload(
      {
        Key: userName + "/" + img,
        Body: file,
      },
      (err, data) => {
        if (err) {
          rej("이미지 업로드 오류:", err);
        } else {
          res("업로드 성공:", data.Location);
        }
      }
    );
  });
}

export function profileDelete(userName, img) {
  return new Promise((res, rej) => {
    s3.deleteObject(
      {
        Key: userName + "/" + img,
      },
      (err, data) => {
        if (err) {
          rej("이미지 삭제 오류:", err);
        } else {
          res("삭제 성공");
        }
      }
    );
  });
}
