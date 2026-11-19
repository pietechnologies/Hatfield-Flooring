const services = [
  ["Hardwood", "Natural grain and timeless character for your living spaces."],
  ["Luxury Vinyl Plank", "Versatile wood-look planks for everyday living."],
  ["Laminate", "Practical, easy-care finishes in a range of tones."],
  ["Tile Flooring", "Distinctive patterns and durable surfaces for your home."],
];
document.querySelector(".cards").innerHTML = services
  .map(
    ([n, d], i) =>
      `<article class="card"><small>0${i + 1}</small><svg viewBox="0 0 60 52" fill="#ede1ca" stroke="#8f754e" stroke-width="1.5" stroke-linejoin="round"><path d="m3 31 32-23 22 12-32 24Z"/><path d="m3 31 0 4 22 13 32-24v-4M25 44v4"/><path d="${["m10 35 32-23M18 39l32-23M22 18l8 4m-5 7 7 4", "m10 35 32-23M18 39l32-23m-28 13 7 4m7-21 8 4", "m10 35 32-23M18 39l32-23m-36 9 7 4m11-4 7 4", "m14 24 22 12m-11-20 22 12M14 37l32-23"][i]}" fill="none"/></svg><h3>${n}</h3><p>${d}</p></article>`,
  )
  .join("");
const pane = document.querySelector("aside"),
  bubble = document.querySelector("#bubble"),
  input = document.querySelector("#chat input"),
  log = document.querySelector("#log");
function toggle() {
  pane.hidden = !pane.hidden;
  bubble.setAttribute("aria-expanded", String(!pane.hidden));
  if (!pane.hidden) input.focus();
  else bubble.focus();
}
bubble.onclick = toggle;
document.querySelector("#close").onclick = toggle;
const answers = [
  [
    "price cost quote estimate budget",
    "For a personalized estimate, email HatfieldFlooring@gmail.com with your room dimensions, material preference, and any photos.",
  ],
  [
    "phone call contact email reach bobby",
    "Call Bobby at (757) 748-1501 or email HatfieldFlooring@gmail.com.",
  ],
  [
    "vinyl hardwood laminate tile material services flooring",
    "Explore hardwood, luxury vinyl plank, laminate, and tile in our services section. Bobby can help you choose a material for your room.",
  ],
  [
    "schedule availability time appointment",
    "Please call Bobby at (757) 748-1501 to confirm availability.",
  ],
];
function say(s) {
  const p = document.createElement("p");
  p.textContent = s;
  if (s.startsWith("You: ")) p.className = "mine";
  log.append(p);
  log.scrollTop = log.scrollHeight;
}
let model;
document.querySelector("#chat").onsubmit = async (e) => {
  e.preventDefault();
  const q = input.value.trim();
  if (!q) return;
  input.value = "";
  say("You: " + q);
  if (/measure|square feet|sq ft/i.test(q)) {
    say(
      "Multiply the length by the width in feet. Use the Project Planner on this page, then carry the result into your estimate.",
    );
    return;
  }
  const match = answers.find(([keys]) =>
    keys.split(" ").some((k) => q.toLowerCase().includes(k)),
  );
  if (match) return say(match[1]);
  const btn = e.target.querySelector("button");
  btn.disabled = true;
  btn.textContent = "…";
  try {
    model ??=
      import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2").then(
        (m) =>
          m.pipeline(
            "zero-shot-classification",
            "Xenova/mobilebert-uncased-mnli",
            { dtype: "q8" },
          ),
      );
    const r = await Promise.race([
      model.then((fn) =>
        fn(q, ["pricing", "contact details", "floor materials", "scheduling"]),
      ),
      new Promise((_, reject) => setTimeout(reject, 30000)),
    ]);
    say(
      r.scores[0] > 0.55
        ? answers[
            [
              "pricing",
              "contact details",
              "floor materials",
              "scheduling",
            ].indexOf(r.labels[0])
          ][1]
        : "For project-specific advice, contact Bobby at (757) 748-1501.",
    );
  } catch {
    say(
      "I can answer common questions about estimates, materials, and scheduling. For anything else, call Bobby at (757) 748-1501.",
    );
  } finally {
    btn.disabled = false;
    btn.textContent = "Send";
  }
};
const $ = (s) => document.querySelector(s);
document.querySelectorAll("#quick button").forEach(
  (b) =>
    (b.onclick = () => {
      input.value = b.textContent;
      $("#chat").requestSubmit();
    }),
);
const dlg = $("dialog");
document.querySelectorAll(".tile").forEach(
  (t) =>
    (t.onclick = () => {
      dlg.querySelector("img").src = t.dataset.image;
      dlg.querySelector("img").alt = t.querySelector("img").alt;
      dlg.querySelector("p").textContent = t.querySelector("img").alt;
      dlg.showModal();
    }),
);
$("#dismiss").onclick = () => dlg.close();
const estimate = $("#estimate");
let localInbox = false;
fetch("./api/status")
  .then((r) => (r.ok ? r.json() : {}))
  .then((s) => {
    localInbox = s.quotes === true;
    render();
  })
  .catch(() => {});
let area = 0,
  step = 0;
function calc() {
  area = Number($("#length").value) * Number($("#width").value);
  if (
    !$("#length").validity.valid ||
    !$("#width").validity.valid ||
    !Number.isFinite(area)
  )
    area = 0;
  $("#area").textContent =
    `${area ? area.toLocaleString("en-US", { maximumFractionDigits: 4 }) : "—"} sq ft`;
}
$("#length").oninput = $("#width").oninput = calc;
calc();
$("#useArea").onclick = (event) => {
  if (!area) {
    event.preventDefault();
    $("#area").textContent = "Enter two positive dimensions.";
    return;
  }
  if (area) estimate.elements.size.value = +area.toFixed(6);
  step = 0;
  render();
};
const sets = [...estimate.querySelectorAll("fieldset")];
function render() {
  sets.forEach((s, i) => {
    s.hidden = i !== step;
    s.disabled = i !== step;
  });
  $("#prev").hidden = !step;
  $("#progress").textContent = `STEP ${step + 1} OF 3`;
  $("#next").textContent =
    step === 2
      ? localInbox
        ? "Submit my quote →"
        : "Continue to secure form ↗"
      : "Continue →";
  if (step === 2) {
    $("#routeNote").textContent = localInbox
      ? "Check your details before submitting your quote request."
      : "This static site uses Hatfield’s CostCertified form. Continue there and enter your details to send your request. Nothing has been sent yet.";
    const e = estimate.elements;
    $("#review").textContent =
      `Name: ${e.name.value}\nEmail: ${e.email.value}\nMaterial: ${e.material.value}\nArea: ${e.size.value ? e.size.value + " sq ft" : "Not measured yet"}\nNotes: ${e.notes.value || "None"}`;
  }
}
render();
$("#prev").onclick = () => {
  step--;
  render();
};
estimate.onsubmit = async (event) => {
  event.preventDefault();
  if (step < 2) {
    step++;
    render();
    return;
  }
  if (!localInbox) {
    location.assign($("#hosted").href);
    return;
  }
  const btn = $("#next");
  btn.disabled = true;
  $("#prev").disabled = true;
  btn.textContent = "Submitting…";
  $("#receipt").textContent = "";
  const data = Object.fromEntries(
    ["name", "email", "material", "size", "notes"].map((k) => [
      k,
      estimate.elements[k].value,
    ]),
  );
  try {
    const r = await fetch("./api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(12000),
    });
    if (r.status !== 201) throw Error();
    const { reference } = await r.json();
    if (!reference) throw Error();
    estimate.reset();
    step = 0;
    render();
    $("#hosted").hidden = true;
    $("#receipt").textContent =
      "Thank you! Your quote request was recorded. Reference: " + reference;
  } catch {
    $("#receipt").textContent =
      "No receipt was confirmed here. Keep your details for reference and use Hatfield’s hosted form, or call Bobby.";
    $("#hosted").hidden = false;
    render();
  } finally {
    btn.disabled = false;
    $("#prev").disabled = false;
  }
};
document.querySelectorAll(".card").forEach((c, i) => {
  const a = document.createElement("a");
  a.className = "more";
  a.href = "#contact";
  a.textContent = "Plan a project →";
  a.onclick = () => {
    step = 0;
    render();
    estimate.elements.material.value = services[i][0];
  };
  c.append(a);
});
let scene = 0;
const scenes = [
  ["living", "OAK LIVING ROOM"],
  ["kitchen", "CHECKERBOARD KITCHEN"],
  ["craft", "PLANK INSTALLATION"],
];
$("#slide").onclick = () => {
  scene = (scene + 1) % 3;
  $(".hero").style.backgroundImage =
    `linear-gradient(90deg,rgba(12,38,33,.95),rgba(12,38,33,.83) 33%,rgba(12,38,33,.2) 69%,transparent),url(assets/${scenes[scene][0]}.jpg)`;
  $("#scene").textContent = `0${scene + 1} / 03   ━━━   ${scenes[scene][1]}`;
};

const menu = $("#menuBtn"),
  nav = $("#siteNav");
function menuOpen(open) {
  nav.classList.toggle("open", open);
  menu.setAttribute("aria-expanded", String(open));
  menu.textContent = open ? "×  Close" : "☰  Menu";
}
menu.onclick = () => menuOpen(!nav.classList.contains("open"));
nav.onclick = () => menuOpen(false);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("open")) {
    menuOpen(false);
    menu.focus();
  }
});
