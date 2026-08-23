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
    });

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
    };

    // Update countdown every 1 second
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
