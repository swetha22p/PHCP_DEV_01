function swDev() {
    let swUrl = `${process.env.PUBLIC_URL}/sw.js`;
    console.log(swUrl)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register(swUrl).then((registration) => {
                console.log('Service Worker registered:', registration);
            }).catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
        });
    }
}

export default swDev;