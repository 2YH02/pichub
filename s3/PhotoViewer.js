var albumBucketName = import.meta.env.VITE_BUCKET_NAME;

AWS.config.region = import.meta.env.VITE_REGION;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
});

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName },
});

function getHtml(template) {
  return template.join("\n");
}

function generateAlbumBtn(albumName) {
  const button = document.createElement("button");
  button.textContent = albumName;
  button.style.margin = "5px";
  button.addEventListener("click", () => {
    viewAlbum(albumName);
  });
  const listItem = document.createElement("li");
  listItem.appendChild(button);
  return listItem;
}

function listAlbums() {
  s3.listObjects({ Delimiter: "/" }, function (err, data) {
    if (err) {
      return alert("There was an error listing your albums: " + err.message);
    } else {
      const viewer = document.getElementById("viewer");
      viewer.innerHTML = "";

      const ul = document.createElement("ul");

      data.CommonPrefixes.forEach((commonPrefix) => {
        const prefix = commonPrefix.Prefix;
        const albumName = decodeURIComponent(prefix.replace("/", ""));
        ul.appendChild(generateAlbumBtn(albumName));
      });

      const message = data.CommonPrefixes.length
        ? "<p>Click on an album name to view it.</p>"
        : "<p>You do not have any albums. Please Create album.</p>";

      viewer.innerHTML = `<h2>Albums</h2> ${message}`;
      viewer.appendChild(ul);
    }
  });
}

function viewAlbum(albumName) {
  var albumPhotosKey = encodeURIComponent(albumName) + "/";
  s3.listObjects({ Prefix: albumPhotosKey }, function (err, data) {
    if (err) {
      return alert("There was an error viewing your album: " + err.message);
    }
    // 'this' references the AWS.Request instance that represents the response
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + "/";

    var photos = data.Contents.map(function (photo) {
      var photoKey = photo.Key;
      var photoUrl = bucketUrl + encodeURIComponent(photoKey);
      return getHtml([
        "<span>",
        "<div>",
        "<br/>",
        '<img style="width:128px;height:128px;" src="' + photoUrl + '"/>',
        "</div>",
        "<div>",
        "<span>",
        photoKey.replace(albumPhotosKey, ""),
        "</span>",
        "</div>",
        "</span>",
      ]);
    });

    var message = photos.length
      ? "<p>The following photos are present.</p>"
      : "<p>There are no photos in this album.</p>";

    const backBtn = document.createElement("button");
    backBtn.textContent = "Back To Albums";
    backBtn.addEventListener("click", listAlbums);

    const viewer = document.getElementById("viewer");
    viewer.innerHTML = "";

    viewer.appendChild(backBtn);

    const h2Album = document.createElement("h2");
    h2Album.textContent = "Album: " + albumName;
    viewer.appendChild(h2Album);

    const pMessage = document.createElement("p");
    pMessage.innerHTML = message;
    viewer.appendChild(pMessage);

    const divPhotos = document.createElement("div");
    divPhotos.innerHTML = getHtml(photos);
    viewer.appendChild(divPhotos);

    const h2End = document.createElement("h2");
    h2End.textContent = "End of Album: " + albumName;
    viewer.appendChild(h2End);

    document
      .getElementsByTagName("img")[0]
      .setAttribute("style", "display:none;");
  });
}

listAlbums();

// window.viewAlbum = viewAlbum;
// window.listAlbums = listAlbums;
