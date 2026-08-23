import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCT7YRj3FrgfjvaB9uKcmVoiStOhYPkYNs",
  authDomain: "undangan-wisuda-a9544.firebaseapp.com",
  projectId: "undangan-wisuda-a9544",
  storageBucket: "undangan-wisuda-a9544.firebasestorage.app",
  messagingSenderId: "967810814435",
  appId: "1:967810814435:web:9b5638f6028611f56b50d6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. URL Parameter Parsing for Guest Name
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    
    const guestNameElement = document.getElementById('guest-name-cover');
    if (guestName) {
        // Decode URI component and prevent XSS slightly by textContent
        guestNameElement.textContent = decodeURIComponent(guestName);
    } else {
        guestNameElement.textContent = "Tamu Undangan";
    }

    // 2. Open Invitation Button Logic
    const openBtn = document.getElementById('open-invitation');
    const coverScreen = document.getElementById('cover-screen');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');
    const musicControl = document.getElementById('music-control');

    openBtn.addEventListener('click', () => {
        // Hide Cover
        coverScreen.style.opacity = '0';
        coverScreen.style.visibility = 'hidden';
        
        // Show Main Content
        mainContent.classList.remove('hidden');
        setTimeout(() => {
            mainContent.classList.add('visible');
            // Allow body to scroll
            document.body.style.overflowY = 'auto';
            // Trigger scroll animations for elements already in view
            handleScrollAnimation();
        }, 100);

        // Play background music
        if(bgMusic) {
            bgMusic.volume = 0.6;
            bgMusic.play().catch(e => console.log("Music play blocked by browser", e));
        }
    });

    // Music Control Button Logic
    if(musicControl && bgMusic) {
        musicControl.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play();
                musicControl.classList.remove('paused');
                musicControl.classList.add('playing');
            } else {
                bgMusic.pause();
                musicControl.classList.remove('playing');
                musicControl.classList.add('paused');
            }
        });
    }

    // Disable body scroll initially
    document.body.style.overflowY = 'hidden';

    // 3. Countdown Timer Logic
    // Target Date: 20 September 2026 14:00:00 WIB (WIB is UTC+7)
    // Create date string that implies local time for the user assuming they are in WIB or we explicitly use timezone
    const targetDate = new Date("Sep 20, 2026 14:00:00").getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            document.getElementById("days").textContent = "00";
            document.getElementById("hours").textContent = "00";
            document.getElementById("minutes").textContent = "00";
            document.getElementById("seconds").textContent = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").textContent = days.toString().padStart(2, '0');
        document.getElementById("hours").textContent = hours.toString().padStart(2, '0');
        document.getElementById("minutes").textContent = minutes.toString().padStart(2, '0');
        document.getElementById("seconds").textContent = seconds.toString().padStart(2, '0');
    }

    // 3. Wishes/Guestbook Functionality (Firebase Firestore)
    const wishesForm = document.getElementById('wishes-form');
    const wishesList = document.getElementById('wishes-list');
    
    // Listen for real-time updates from Firestore
    if(wishesList) {
        const q = query(collection(db, "wishes"), orderBy("timestamp", "desc"));
        onSnapshot(q, (snapshot) => {
            wishesList.innerHTML = '';
            
            if (snapshot.empty) {
                wishesList.innerHTML = '<p style="color: var(--champagne-beige); opacity: 0.7; text-align: center; margin-top: 1rem;">Belum ada ucapan. Jadilah yang pertama!</p>';
                return;
            }

            snapshot.forEach((doc) => {
                const wish = doc.data();
                const wishEl = document.createElement('div');
                // Menggunakan animasi fadeIn standar agar tidak perlu IntersectionObserver
                wishEl.className = 'wish-item';
                wishEl.style.animation = 'fadeIn 0.5s ease-out forwards';
                
                let timeStr = "Baru saja";
                if(wish.timestamp) {
                    const date = wish.timestamp.toDate();
                    timeStr = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' });
                }

                wishEl.innerHTML = `
                    <div class="wish-item-name">${wish.name}</div>
                    <div class="wish-item-time">${timeStr}</div>
                    <div class="wish-item-msg">${wish.message}</div>
                `;
                wishesList.appendChild(wishEl);
            });
        });
    }

    if(wishesForm) {
        const submitBtn = wishesForm.querySelector('button[type="submit"]');
        wishesForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('wish-name').value;
            const msgInput = document.getElementById('wish-message').value;
            
            if(nameInput && msgInput) {
                submitBtn.textContent = "Mengirim...";
                submitBtn.disabled = true;
                try {
                    await addDoc(collection(db, "wishes"), {
                        name: nameInput,
                        message: msgInput,
                        timestamp: serverTimestamp()
                    });
                    wishesForm.reset();
                } catch(error) {
                    console.error("Error adding document: ", error);
                    alert("Gagal mengirim ucapan, pastikan Anda sedang online.");
                } finally {
                    submitBtn.textContent = "Kirim Ucapan";
                    submitBtn.disabled = false;
                }
            }
        });
    }

    // Initialize countdown
    setInterval(updateCountdown, 1000);
    updateCountdown(); // initial call

    // 4. Scroll Animations (Intersection Observer)
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target); // Run animation once
            }
        });
    }, observerOptions);

    const handleScrollAnimation = () => {
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    };
});
