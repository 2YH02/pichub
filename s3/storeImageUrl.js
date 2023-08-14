var albumBucketName = import.meta.env.VITE_BUCKET_NAME;

AWS.config.region = import.meta.env.VITE_REGION;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
});

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName },
});

function generateAlbumBtn(userName) {
  const data = JSON.parse(localStorage.getItem("users"));
  const user = data.find((v) => v.name === userName);

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

  albumBtn.textContent = "Go to Album";
  albumBtn.classList.add("btn");
  profileBtn.textContent = "Go to Profile";
  profileBtn.classList.add("btn-reverse");

  img.src = user.picture;
  name.textContent = user.name;
  nation.textContent = user.nation;
  pn.textContent = user.pn;
  email.textContent = user.email;

  userBtnWrap.append(albumBtn, profileBtn);

  imgWrap.append(img);
  infoWrap.append(name, nation, pn, email, userBtnWrap);

  userBox.append(imgWrap, infoWrap);

  // console.log(user);

  // button.classList.add("album-btn");
  albumBtn.addEventListener("click", () => {
    listAlbums(userName);
  });

  return userBox;
}

function generateUser() {
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

  images.style.display = "none";
  viewer.style.display = "none";

  const users = document.getElementById("users");

  users.innerHTML = "";

  users.style.display = "flex";
}

function generateAlbumImg(album, userName, albumName) {
  s3.listObjects({ Prefix: userName + "/" + albumName }, function (err, data) {
    if (err) {
      return alert("There was an error viewing your album: " + err.message);
    } else {
      // console.log(data);
      var href = this.request.httpRequest.endpoint.href;
      var bucketUrl = href + albumBucketName + "/";
      if (!data.Contents[1]) {
        album.style.backgroundImage = "url('./images/album.png')";
      } else {
        var photoKey = data.Contents[1].Key;
        var photoUrl = bucketUrl + encodeURIComponent(photoKey);
        album.style.backgroundImage = `url(${photoUrl})`;
      }
    }
  });
}

function downImg() {
  const signedUrl = s3.getSignedUrl("getObject", {
    Bucket: albumBucketName,
    Key: "user1/album1/cookie.jpg",
    Expires: 3600,
  });
  console.log("다운로드 링크:", signedUrl);
}

function listUsers() {
  s3.listObjects({ Delimiter: "/" }, function (err, data) {
    if (err) {
      return alert("There was an error listing your albums: " + err.message);
    } else {
      // console.log(data);
      generateUser();

      data.CommonPrefixes.forEach((commonPrefix) => {
        const prefix = commonPrefix.Prefix;
        const userName = decodeURIComponent(prefix.replace("/", ""));
        users.appendChild(generateAlbumBtn(userName));
        // console.log(userName);
      });
    }
  });
}

function listAlbums(userName) {
  var albumPhotosKey = encodeURIComponent(userName) + "/";
  s3.listObjects(
    { Prefix: albumPhotosKey, Delimiter: "/" },
    function (err, data) {
      if (err) {
        return alert("There was an error viewing your album: " + err.message);
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

        usersEl.style.display = "none";
        viewer.style.display = "grid";
        images.style.display = "none";

        // console.log(data.CommonPrefixes);
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
      }
    }
  );
}

function viewAlbum(userName, albumName) {
  s3.listObjects({ Prefix: userName + "/" + albumName }, function (err, data) {
    if (err) {
      return alert("There was an error viewing your album: " + err.message);
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
      var href = this.request.httpRequest.endpoint.href;
      var bucketUrl = href + albumBucketName + "/";

      const viewer = document.getElementById("viewer");
      const images = document.getElementById("images");

      images.style.display = "grid";
      viewer.style.display = "none";

      data.Contents.forEach((content) => {
        var photoKey = content.Key;
        var photoUrl = bucketUrl + encodeURIComponent(photoKey);

        const imgEl = document.createElement("img");
        const imgWrap = document.createElement("div");

        const imgBtnWrap = document.createElement("div");
        const editBtn = document.createElement("div");
        const downBtn = document.createElement("div");

        editBtn.textContent = "Edit";
        editBtn.style.width = "80px";
        editBtn.style.fontWeight = "bold";
        editBtn.classList.add("btn-reverse");

        downBtn.textContent = "Down";
        downBtn.style.width = "80px";
        downBtn.style.fontWeight = "bold";
        downBtn.classList.add("btn");

        downBtn.addEventListener("click", () => {
          downImg();
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
    }
  });
}

listUsers();
