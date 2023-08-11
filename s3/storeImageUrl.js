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
  const button = document.createElement("div");
  button.textContent = userName;

  button.classList.add("album-btn");
  button.addEventListener("click", () => {
    listAlbums(userName);
  });

  return button;
}

function listUsers() {
  s3.listObjects({ Delimiter: "/" }, function (err, data) {
    if (err) {
      return alert("There was an error listing your albums: " + err.message);
    } else {
      const listTitle = document.getElementById("list-title");
      listTitle.textContent = "User lists";

      const getBackBtn = document.getElementsByClassName("buttonWrap");
      const backBtns = [...getBackBtn];

      backBtns.forEach((backBtn) => {
        backBtn.innerHTML = "";
        backBtn.display = "none";
      });

      const images = document.getElementById("images");
      const viewer = document.getElementById("viewer");
      const users = document.getElementById("users");

      images.innerHTML = "";
      users.innerHTML = "";

      images.style.display = "none";
      viewer.style.display = "none";
      users.style.display = "flex";

      // console.log(data);

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

          album.classList.add("album-btn");
          album.textContent = albumName;

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
        imgEl.src = photoUrl;

        imgWrap.append(imgEl);
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
