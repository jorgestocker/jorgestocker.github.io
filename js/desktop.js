const screen = document.getElementById("screen");
const icons = Array.from(document.querySelectorAll(".icon"));
const taskButtons = document.getElementById("taskButtons");
const clock = document.getElementById("clock");

let z = 10;

const windows = {
  about: document.getElementById("win-about"),
  experience: document.getElementById("win-experience"),
  skills: document.getElementById("win-skills"),
  education: document.getElementById("win-education"),
  contact: document.getElementById("win-contact"),
};

const tasks = {};

function isMobileFrame() {
  return window.innerWidth <= 520;
}

function setActive(winEl) {
  document
    .querySelectorAll(".window")
    .forEach((w) => w.classList.remove("active"));
  winEl.classList.add("active");
  winEl.style.zIndex = ++z;

  Object.keys(tasks).forEach((k) => tasks[k].classList.remove("active"));
  const key = winEl.getAttribute("data-key");
  if (key && tasks[key]) tasks[key].classList.add("active");
}

function ensureTaskButton(key, title) {
  if (tasks[key]) return;

  const btn = document.createElement("div");
  btn.className = "taskbtn";
  btn.textContent = title;
  btn.onclick = () => {
    const w = windows[key];
    if (!w) return;
    if (w.style.display === "none") w.style.display = "block";
    if (isMobileFrame()) fitWindowToScreen(w);
    setActive(w);
  };

  tasks[key] = btn;
  taskButtons.appendChild(btn);
}

function fitWindowToScreen(winEl) {
  const pad = 8;
  const taskbarH = 46;
  const rect = screen.getBoundingClientRect();

  winEl.style.left = pad + "px";
  winEl.style.top = pad + "px";
  winEl.style.width = rect.width - pad * 2 + "px";
  winEl.style.height = rect.height - taskbarH - pad * 2 + "px";
  winEl.setAttribute("data-max", "1");
}

function openWindow(key) {
  const w = windows[key];
  if (!w) return;

  w.setAttribute("data-key", key);
  w.style.display = "block";
  ensureTaskButton(key, w.querySelector(".title").textContent);

  if (isMobileFrame()) fitWindowToScreen(w);

  setActive(w);
}

function closeWindow(winEl) {
  const key = winEl.getAttribute("data-key");
  winEl.style.display = "none";
  winEl.classList.remove("active");

  if (key && tasks[key]) {
    taskButtons.removeChild(tasks[key]);
    delete tasks[key];
  }

  const any = Array.from(document.querySelectorAll(".window")).filter(
    (w) => w.style.display !== "none"
  );
  if (any.length) setActive(any[any.length - 1]);
}

function minimizeWindow(winEl) {
  winEl.style.display = "none";
  winEl.classList.remove("active");

  const key = winEl.getAttribute("data-key");
  if (key && tasks[key]) tasks[key].classList.remove("active");
}

function toggleMaximize(winEl) {
  if (isMobileFrame()) {
    fitWindowToScreen(winEl);
    setActive(winEl);
    return;
  }

  const isMax = winEl.getAttribute("data-max") === "1";
  if (!isMax) {
    winEl.setAttribute(
      "data-prev",
      JSON.stringify({
        left: winEl.style.left,
        top: winEl.style.top,
        width: winEl.style.width,
        height: winEl.style.height,
      })
    );

    winEl.style.left = "8px";
    winEl.style.top = "8px";

    const rect = screen.getBoundingClientRect();
    winEl.style.width = rect.width - 16 + "px";
    winEl.style.height = rect.height - 54 + "px";
    winEl.setAttribute("data-max", "1");
  } else {
    const prev = winEl.getAttribute("data-prev");
    if (prev) {
      const p = JSON.parse(prev);
      winEl.style.left = p.left;
      winEl.style.top = p.top;
      winEl.style.width = p.width;
      winEl.style.height = p.height;
    }
    winEl.setAttribute("data-max", "0");
  }
  setActive(winEl);
}


let lastClick = { el: null, t: 0 };
icons.forEach((ic) => {
  ic.addEventListener("click", () => {
    icons.forEach((i) => i.classList.remove("selected"));
    ic.classList.add("selected");

    const now = Date.now();
    if (lastClick.el === ic && now - lastClick.t < 400) {
      openWindow(ic.getAttribute("data-open"));
    }
    lastClick = { el: ic, t: now };
  });

  ic.addEventListener("dblclick", () =>
    openWindow(ic.getAttribute("data-open"))
  );
});


document.querySelectorAll(".window").forEach((winEl) => {
  winEl.addEventListener("mousedown", () => setActive(winEl));

  const closeBtn = winEl.querySelector("[data-close]");
  const minBtn = winEl.querySelector("[data-min]");
  const maxBtn = winEl.querySelector("[data-max]");

  closeBtn.onclick = (e) => {
    e.stopPropagation();
    closeWindow(winEl);
  };
  minBtn.onclick = (e) => {
    e.stopPropagation();
    minimizeWindow(winEl);
  };
  maxBtn.onclick = (e) => {
    e.stopPropagation();
    toggleMaximize(winEl);
  };
});


let drag = null;

document.querySelectorAll("[data-drag]").forEach((tb) => {
  tb.addEventListener("mousedown", (e) => {
    const winEl = tb.closest(".window");
    if (!winEl) return;

    if (isMobileFrame()) return;
    if (winEl.getAttribute("data-max") === "1") return;

    setActive(winEl);

    drag = {
      win: winEl,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: parseInt(winEl.style.left || winEl.offsetLeft, 10),
      startTop: parseInt(winEl.style.top || winEl.offsetTop, 10),
    };
    e.preventDefault();
  });
});

window.addEventListener("mousemove", (e) => {
  if (!drag) return;

  const dx = e.clientX - drag.startX;
  const dy = e.clientY - drag.startY;

  let left = drag.startLeft + dx;
  let top = drag.startTop + dy;

  const s = screen.getBoundingClientRect();
  const w = drag.win.getBoundingClientRect();

  const maxLeft = s.width - w.width - 8;
  const maxTop = s.height - w.height - 54;

  if (left < 0) left = 0;
  if (top < 0) top = 0;
  if (left > maxLeft) left = maxLeft;
  if (top > maxTop) top = maxTop;

  drag.win.style.left = left + "px";
  drag.win.style.top = top + "px";
});

window.addEventListener("mouseup", () => {
  drag = null;
});


function tick() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  clock.textContent = hh + ":" + mm;
}
tick();
setInterval(tick, 1000);


document.getElementById("startBtn").onclick = () => {
  alert(
    "Start Menu is not installed.\nPlease insert the floppy disk and try again."
  );
};
