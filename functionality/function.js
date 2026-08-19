const musicDatabase = {
  "90s_hindi": [
    { file: "90sHindi/ChuraKeDilMera.mp3", title: "Chura Ke Dil Mera", artist: "90s Hindi Music" }
  ],
  "90s_bangla": [
    { file: "90sBangla/AgunerDinSheshHobe.mp3", title: "Aguner Din Shesh Hobe", artist: "90s Bangla Music" }
  ],
  "hindi_love": [
    { file: "LoveHindi/RimJhim.mp3", title: "Rim Jhim", artist: "Hindi Love Songs" }
  ],
  "hindi_sad": [
    { file: "SadHindi/BayaanNahinMilta.mp3", title: "Bayaan Nahin Milta", artist: "Hindi Sad Songs" }
  ],
  "bangla_band": [
    { file: "BanglaBand/Mrigakkhi.mp3", title: "Mrigakkhi", artist: "Bangla Band Music" }
  ],
  "bhojpuri": [
    { file: "Bhojpuri/ChhalakataHamroJawaniya.mp3", title: "Chhalakata Hamro Jawaniya", artist: "Bhojpuri Hit" },
    { file: "Bhojpuri/DardKaraara.mp3", title: "Dard Karaara", artist: "Bhojpuri Hit" },
    { file: "Bhojpuri/DhukupukuBuk.mp3", title: "Dhukupuku Buk", artist: "Bhojpuri Hit" },
    { file: "Bhojpuri/EkPardesiMera.mp3", title: "Ek Pardesi Mera", artist: "Bhojpuri Hit" },
    { file: "Bhojpuri/KamriyaKareLapalapLollypopLagelu.mp3", title: "Kamriya Kare Lapalap", artist: "Bhojpuri Hit" },
    { file: "Bhojpuri/KhesariLalYadav.mp3", title: "Khesari Lal Yadav", artist: "Bhojpuri Hit" },
    { file: "Bhojpuri/MaradMathaKeDa.mp3", title: "Marad Matha Ke Da", artist: "Bhojpuri Hit" },
    { file: "Bhojpuri/PagalBanaibe.mp3", title: "Pagal Banaibe", artist: "Bhojpuri Hit" },
    { file: "Bhojpuri/PalaSatake.mp3", title: "Pala Satake", artist: "Bhojpuri Hit" },
    { file: "Bhojpuri/SajKeSawarKe.mp3", title: "Saj Ke Sawar Ke", artist: "Bhojpuri Hit" },
    { file: "Bhojpuri/SorrySorry.mp3", title: "Sorry Sorry", artist: "Bhojpuri Hit" }
  ]
};

let currentCategory = "90s_hindi"; 
let playlist = musicDatabase[currentCategory]; 
let currentIndex = 0;
let isPlaying = false, seeking = false;
let volume = 100;
let muted = false;

const audioPlayer = document.getElementById("audioPlayer");
const $ = id => document.getElementById(id);

const formatTime = seconds => {
  if (isNaN(seconds)) return "0:00";
  seconds = Number(seconds) || 0;
  return Math.floor(seconds / 60) + ":" + String(Math.floor(seconds % 60)).padStart(2,"0");
};

function getSong() { return playlist[currentIndex]; }

function updateIcons() {
  $("playIcon").setAttribute("data-lucide", isPlaying ? "pause" : "play");
  $("miniPlayIcon").setAttribute("data-lucide", isPlaying ? "pause" : "play");
  $("muteIcon").setAttribute("data-lucide", muted || volume === 0 ? "volume-x" : "volume-2");
  lucide.createIcons();
}

function updateSongDisplay() {
  const song = getSong();
  if (!song) return;
  $("songTitle").textContent = song.title;
  $("songArtist").textContent = song.artist;
  $("miniTitle").textContent = song.title;
  
  const select = $("categorySelect");
  $("currentCategoryLabel").textContent = select.options[select.selectedIndex].text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\s/g, ' ').trim();
}

function setPlaying(next) {
  isPlaying = next;
  $("playerCassette").classList.toggle("is-playing", isPlaying);
  $("heroCassette").classList.toggle("is-playing", isPlaying);
  $("visualizer").classList.toggle("active", isPlaying);
  $("playState").textContent = isPlaying ? "Playing" : "Paused";
  updateIcons();
}

function selectSong(index, autoplay) {
  if (index < 0 || index >= playlist.length) return;
  currentIndex = index;
  updateSongDisplay();
  $("progressBar").value = 0; 
  $("currentTime").textContent = "0:00";
  
  const msgDiv = $("formMessage");
  if(msgDiv) msgDiv.textContent = ""; 
  
  audioPlayer.src = playlist[index].file;
  audioPlayer.load();
  
  if (autoplay) {
    audioPlayer.play().catch(e => {
        console.log("Play error:", e);
    });
  }
}

function nextSong(autoplay = true) {
  if (!playlist.length) return;
  let next = currentIndex + 1;
  if (next >= playlist.length) next = 0; 
  selectSong(next, autoplay);
}

function previousSong() {
  if (audioPlayer.currentTime > 5) { audioPlayer.currentTime = 0; return; }
  let prev = currentIndex - 1;
  if (prev < 0) prev = playlist.length - 1;
  selectSong(prev, true);
}

$("categorySelect").addEventListener("change", (e) => {
  currentCategory = e.target.value;
  playlist = musicDatabase[currentCategory];
  currentIndex = 0; 
  selectSong(0, true);
});

audioPlayer.addEventListener("error", () => {
  $("formMessage").textContent = "অডিও ফাইলটি খুঁজে পাওয়া যায়নি! ফোল্ডারের নাম এবং গানের নামগুলো চেক করুন।";
});

audioPlayer.addEventListener("play", () => setPlaying(true));
audioPlayer.addEventListener("pause", () => setPlaying(false));

audioPlayer.addEventListener("timeupdate", () => {
  if (seeking) return;
  const current = audioPlayer.currentTime || 0;
  const duration = audioPlayer.duration || 0;
  $("currentTime").textContent = formatTime(current);
  if(duration) $("durationTime").textContent = formatTime(duration);
  $("progressBar").max = duration || 100;
  $("progressBar").value = current;
  $("miniProgress").style.width = duration ? (current / duration * 100) + "%" : "0%";
});

audioPlayer.addEventListener("ended", () => nextSong(true));

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  
  audioPlayer.volume = 1.0;
  audioPlayer.muted = false;
  $("volumeBar").value = 100; 
  $("volumeText").textContent = "100%";
  
  updateSongDisplay(); 
  updateBangladeshTime();
  setInterval(updateBangladeshTime, 60000);

  audioPlayer.src = playlist[currentIndex].file;

  $("playBtn").addEventListener("click", () => { isPlaying ? audioPlayer.pause() : audioPlayer.play(); });
  $("miniPlay").addEventListener("click", () => $("playBtn").click());
  $("nextBtn").addEventListener("click", () => nextSong(true));
  $("miniNext").addEventListener("click", () => nextSong(true));
  $("previousBtn").addEventListener("click", previousSong);
  $("miniPrevious").addEventListener("click", previousSong);

  $("progressBar").addEventListener("input", () => { 
    seeking = true; 
    $("currentTime").textContent = formatTime($("progressBar").value); 
  });
  $("progressBar").addEventListener("change", () => { 
    audioPlayer.currentTime = Number($("progressBar").value); 
    seeking = false; 
  });
  
  $("volumeBar").addEventListener("input", event => {
    volume = Number(event.target.value); 
    muted = volume === 0;
    $("volumeText").textContent = volume + "%";
    audioPlayer.volume = volume / 100;
    audioPlayer.muted = muted;
    updateIcons();
  });
  
  $("muteBtn").addEventListener("click", () => {
    muted = !muted;
    audioPlayer.muted = muted;
    updateIcons();
  });

  const hero = document.getElementById("home");
  const observer = new IntersectionObserver(entries => $("miniPlayer").classList.toggle("visible", !entries[0].isIntersecting), { threshold:.2 });
  if(hero) observer.observe(hero);
});

function updateBangladeshTime() {
  const now = new Date();
  const bdHours = (now.getUTCHours() + 6) % 24;
  const bdTime = String(bdHours).padStart(2, '0') + ':' + String(now.getUTCMinutes()).padStart(2, '0');
  const timeEl = $("bangladeshTime");
  if (timeEl) timeEl.textContent = bdTime;
}