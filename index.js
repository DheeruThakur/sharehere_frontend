const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileinput");
const bgProgress = document.querySelector(".bg-progress");
const percentDiv = document.querySelector("#percent");
const progressBar = document.querySelector(".progress-bar");
const progressContainer = document.querySelector(".progress-container");
const imageURL = document.querySelector("#fileURL");
const sharingContainer = document.querySelector(".sharing-container");
const copy = document.querySelector(".copy");
const emailContainer = document.querySelector(".form-container");
const toast = document.querySelector(".toast");
const fileSize = 100 * 1024 * 1024;

const host = "https://sharehereapp-production.up.railway.app/";
const uploadUrl = `${host}api/files`;
const emailUrl = `${host}api/files/send`;

const browse = document.querySelector(".browse");

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  console.log("dragging");
  if (!dropZone.classList.contains("dragged")) {
    dropZone.classList.add("dragged");
  }
});
dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();

  const files = e.dataTransfer.files;
  if (files.length === 1) {
    if (files[0].size < fileSize) {
      fileInput.files = files;
      uploadFile();
    } else {
      showToast("Max file size is 100MB");
    }
  } else if (files.length > 1) {
    showToast("You can't upload multiple files");
  }

  dropZone.classList.remove("dragged");
});

fileInput.addEventListener("change", () => {
  uploadFile();
});

browse.addEventListener("click", (e) => {
  fileInput.click();
});

copy.addEventListener("click", () => {
  imageURL.select();
  document.execCommand("copy");
  showToast("Link Copied !!!");
});

// Ab hum file upload karenge jo drop kari hai

const uploadFile = () => {
  if (fileInput.files.length > 1) {
    resetFileInput();
    showToast("Upload single file");
    return;
  }

  const file = fileInput.files[0];

  if (file.size > fileSize) {
    resetFileInput();
    showToast("File size exceeded");
    return;
  }

  progressContainer.style.display = "block";

  const formData = new FormData();
  formData.append("myfile", file);

  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      // console.log(xhr.response);
      onUploadSuccess(JSON.parse(xhr.response));
    }
  };

  xhr.upload.onprogress = updateProgress;
  xhr.upload.onerror = () => {
    resetFileInput();
    showToast(`Error occured : ${xhr.statusText}`);
  };

  xhr.open("POST", uploadUrl);
  xhr.send(formData);
};

const updateProgress = (e) => {
  const percentage = Math.round((e.loaded / e.total) * 100);
  console.log(percentage);

  bgProgress.style.width = `${percentage}%`;
  percentDiv.innerHTML = percentage;
  progressBar.style.transform = `scaleX(${percentage / 100})`;
};

const onUploadSuccess = ({ file: url }) => {
  console.log(url);
  emailContainer[2].removeAttribute("disabled");
  resetFileInput();
  imageURL.value = url;
  progressContainer.style.display = "none";
  sharingContainer.style.display = "block";
};

const resetFileInput = () => {
  fileInput.value = "";
};

emailContainer.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("submit form");
  const url = imageURL.value;

  const formData = {
    uuid: url.split("/")[4],
    emailTo: emailContainer.elements["to-email"].value,
    emailFrom: emailContainer.elements["from-email"].value,
  };

  emailContainer[2].setAttribute("disabled", "true");

  console.table(formData);
  fetch(emailUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then(({ success }) => {
      if (success) {
        sharingContainer.style.display = "none";
        showToast("Email Sent");
      }
    });
});
let toastTimer;
const showToast = (msg) => {
  toast.innerHTML = msg;
  toast.style.transform = "translate(-50% , 0)";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.transform = "translate(-50% , 60px)";
  }, 2000);
};
