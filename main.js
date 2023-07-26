function initializePage() {
    let button1 = document.getElementById('rRandomize');
    button1.addEventListener("click", () => {
        window.location.href = './subpages/randomize.html';
    });
}

initializePage();
