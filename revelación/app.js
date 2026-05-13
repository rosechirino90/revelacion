import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  getDocs
}
from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";


// ========================================
// FIREBASE CONFIG
// ========================================

const firebaseConfig = {

  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_BUCKET.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========================================
// ELEMENTOS
// ========================================

const nameInput = document.getElementById("name");
const errorMessage = document.getElementById("errorMessage");

const girlVote = document.getElementById("girlVote");
const boyVote = document.getElementById("boyVote");

const girlPercent = document.getElementById("girlPercent");
const boyPercent = document.getElementById("boyPercent");

const girlBar = document.getElementById("girlBar");
const boyBar = document.getElementById("boyBar");

const totalVotes = document.getElementById("totalVotes");

const alreadyVoted = document.getElementById("alreadyVoted");

const revealSection = document.getElementById("revealSection");
const revealText = document.getElementById("revealText");

const voteCard = document.getElementById("voteCard");

// ========================================
// FECHA DE REVELACIÓN
// ========================================

const revealDate = new Date("2026-12-31T20:00:00");

// ========================================
// CONTADOR
// ========================================

function updateCountdown(){

  const now = new Date().getTime();
  const distance = revealDate - now;

  if(distance <= 0){

    revealBaby();
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));

  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24))
    / (1000 * 60 * 60)
  );

  const minutes = Math.floor(
    (distance % (1000 * 60 * 60))
    / (1000 * 60)
  );

  const seconds = Math.floor(
    (distance % (1000 * 60))
    / 1000
  );

  document.getElementById("days").innerText = days;
  document.getElementById("hours").innerText = hours;
  document.getElementById("minutes").innerText = minutes;
  document.getElementById("seconds").innerText = seconds;
}

setInterval(updateCountdown,1000);

// ========================================
// VALIDACIÓN
// ========================================

function validateName(){

  if(nameInput.value.trim() === ""){

    nameInput.classList.add("error");
    errorMessage.classList.add("show");

    return false;
  }

  nameInput.classList.remove("error");
  errorMessage.classList.remove("show");

  return true;
}

// ========================================
// EVITAR DOBLE VOTO
// ========================================

const voted = localStorage.getItem("gender_vote");

if(voted){

  alreadyVoted.classList.remove("hidden");
}

// ========================================
// VOTAR
// ========================================

async function vote(gender){

  if(!validateName()) return;

  if(localStorage.getItem("gender_vote")){

    alreadyVoted.classList.remove("hidden");
    return;
  }

  await addDoc(collection(db,"votes"),{

    name: nameInput.value,
    gender,
    createdAt: new Date()

  });

  localStorage.setItem("gender_vote","true");

  alreadyVoted.classList.remove("hidden");
}

// ========================================
// BOTONES
// ========================================

girlVote.addEventListener("click",()=> vote("girl"));
boyVote.addEventListener("click",()=> vote("boy"));

// ========================================
// TIEMPO REAL
// ========================================

onSnapshot(collection(db,"votes"), async ()=>{

  const snapshot = await getDocs(collection(db,"votes"));

  let girl = 0;
  let boy = 0;

  snapshot.forEach(doc=>{

    const data = doc.data();

    if(data.gender === "girl"){
      girl++;
    }else{
      boy++;
    }
  });

  const total = girl + boy;

  const girlPct = total
    ? Math.round((girl / total) * 100)
    : 0;

  const boyPct = total
    ? Math.round((boy / total) * 100)
    : 0;

  girlPercent.innerText = `${girlPct}%`;
  boyPercent.innerText = `${boyPct}%`;

  girlBar.style.width = `${girlPct}%`;
  boyBar.style.width = `${boyPct}%`;

  totalVotes.innerText = total;
});

// ========================================
// WHATSAPP
// ========================================

document.getElementById("shareBtn")
.addEventListener("click",()=>{

  const text = encodeURIComponent(
    "💙🎀 Participa en nuestra revelación de género y vota aquí: https://TU_LINK.com"
  );

  window.open(`https://wa.me/?text=${text}`);
});

// ========================================
// REVELACIÓN
// ========================================

function revealBaby(){

  voteCard.style.display = "none";

  revealSection.classList.remove("hidden");

  const babyGender = "girl";

  if(babyGender === "girl"){

    revealText.innerHTML = "¡Es niña! 🎀";

    document.body.style.background =
      "linear-gradient(135deg,#ffc2d1,#ffe5ec)";

  }else{

    revealText.innerHTML = "¡Es niño! 💙";

    document.body.style.background =
      "linear-gradient(135deg,#bde0fe,#a2d2ff)";
  }

  confetti({
    particleCount: 200,
    spread: 120
  });
}