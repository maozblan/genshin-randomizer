function initializePage() {
    let button1 = document.getElementById('rRandomize');
    button1.addEventListener("click", () => {
        window.location.href = './subpages/randomize.html';
    });
    
    let button2 = document.getElementById('rProfiles');
    button2.addEventListener("click", () => {
        window.location.href = './subpages/profiles.html';
    });

    let button3 = document.getElementById('rAbout');
    button3.addEventListener("click", () => {
        window.location.href = './subpages/about.html';
    });
}

initializePage();
