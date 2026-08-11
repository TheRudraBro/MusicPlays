
    const STORAGE_KEY = "musicplays-retro-v2";
    
    // আপনার লোকাল song.mp3 ফাইল
    const basePlaylist = [
      { 
        id: "song-1", 
        file: "MusicPlays/song.mp3", 
        title: "Bhalobashi Jare", 
        artist: "Bangla Retro 2001", 
        album: "Tonight’s Mixtape", 
        duration: "—" 
      },
         { 
        id: "song-2", 
        file: "MusicPlays/song1.mp3", 
        title: "Rim Jhim", 
        artist: "Jubin Nautiyal", 
        album: "Tonight’s Mixtape", 
        duration: "—" 
      }

    ];

    let playlist = basePlaylist; 
    let currentIndex = 0;
    let isPlaying = false, seeking = false;
    let volume = 100;
    let muted = false;
    let shuffle = false;
    let repeatMode = "off";
    
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
      $("repeatIcon").setAttribute("data-lucide", repeatMode === "one" ? "repeat-1" : "repeat");
      lucide.createIcons();
    }

    function updateSongDisplay() {
      const song = getSong();
      if (!song) return;
      $("songTitle").textContent = song.title;
      $("songArtist").textContent = song.artist;
      $("songAlbum").textContent = song.album;
      $("miniTitle").textContent = song.title;
    }

    function setPlaying(next) {
      isPlaying = next;
      $("playerCassette").classList.toggle("is-playing", isPlaying);
      $("heroCassette").classList.toggle("is-playing", isPlaying);
      $("visualizer").classList.toggle("active", isPlaying);
      $("playState").textContent = isPlaying ? "Now playing" : "Paused";
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
      
      // ফাইল লোড করা
      audioPlayer.src = playlist[index].file;
      audioPlayer.load();
      
      if (autoplay) {
        audioPlayer.play().catch(e => {
            console.log("Play error:", e);
            if(msgDiv) msgDiv.textContent = "Please disable IDM/Downloader extension if audio is not playing.";
        });
      }
    }

    function nextSong(autoplay = true) {
      if (!playlist.length) return;
      let next = currentIndex + 1;
      if (next >= playlist.length) {
        if (repeatMode === "all") next = 0;
        else { setPlaying(false); return; }
      }
      selectSong(next, autoplay);
    }

    function previousSong() {
      if (audioPlayer.currentTime > 5) { audioPlayer.currentTime = 0; return; }
      selectSong(0, true);
    }

    // Error Handling
    audioPlayer.addEventListener("error", (e) => {
      const msgDiv = $("formMessage");
      if(msgDiv) msgDiv.textContent = "অডিও ফাইলটি খুঁজে পাওয়া যায়নি! song.mp3 ফাইলটি HTML ফাইলের সাথেই রাখুন।";
      console.error("Audio Load Error:", audioPlayer.error);
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

    audioPlayer.addEventListener("ended", () => {
      if (repeatMode === "one") { 
        audioPlayer.currentTime = 0; 
        audioPlayer.play(); 
      } else { 
        nextSong(true); 
      }
    });

    document.addEventListener("DOMContentLoaded", () => {
      // Force volume to 100% on start
      audioPlayer.volume = 1.0;
      audioPlayer.muted = false;
      $("volumeBar").value = 100; 
      $("volumeText").textContent = "100%";
      
      updateSongDisplay(); 
      updateIcons();
      updateBangladeshTime();
      setInterval(updateBangladeshTime, 60000);

      audioPlayer.src = playlist[currentIndex].file;

      $("playBtn").addEventListener("click", () => { isPlaying ? audioPlayer.pause() : audioPlayer.play().catch(e => {
          $("formMessage").textContent = "ব্রাউজারের কোনো এক্সটেনশন (যেমন IDM) গানটি আটকে দিচ্ছে। এক্সটেনশন অফ করুন।";
      }); });
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
