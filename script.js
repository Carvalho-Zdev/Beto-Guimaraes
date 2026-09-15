/* =========================================
   BETO GUIMARÃES 2040
   CONTROLE AUTOMÁTICO DOS VÍDEOS
========================================= */

const videos = document.querySelectorAll(".scroll-video");

let activeVideo = null;
let audioUnlocked = false;


/* =========================================
   PARAR TODOS OS OUTROS VÍDEOS
========================================= */

function stopOtherVideos(currentVideo) {

    videos.forEach((video) => {

        if (video !== currentVideo) {
            video.pause();
        }

    });

}


/* =========================================
   ATIVAR VÍDEO
========================================= */

function activateVideo(video) {

    if (!video) return;

    if (activeVideo === video && !video.paused) {
        return;
    }

    stopOtherVideos(video);

    activeVideo = video;

    /*
       O site sempre tenta reproduzir
       com áudio.
    */

    video.muted = false;

    const playPromise = video.play();

    if (playPromise !== undefined) {

        playPromise.catch(() => {

            /*
               Se o navegador bloquear autoplay
               com áudio, começa temporariamente
               sem áudio.
            */

            video.muted = true;

            video.play().catch(() => {});

        });

    }

}


/* =========================================
   LIBERAR ÁUDIO APÓS INTERAÇÃO
========================================= */

function unlockAudio() {

    audioUnlocked = true;

    if (activeVideo) {

        activeVideo.muted = false;

        activeVideo.play().catch(() => {});

    }

}


/*
   Depois do primeiro toque/clique,
   tentamos manter áudio nos próximos vídeos.
*/

document.addEventListener(
    "pointerdown",
    unlockAudio,
    { once: true }
);

document.addEventListener(
    "touchstart",
    unlockAudio,
    {
        once: true,
        passive: true
    }
);

document.addEventListener(
    "click",
    unlockAudio,
    { once: true }
);


/* =========================================
   CALCULAR QUANTO DO VÍDEO ESTÁ VISÍVEL
========================================= */

function getVisiblePercentage(video) {

    const rect = video.getBoundingClientRect();

    const visibleTop =
        Math.max(rect.top, 0);

    const visibleBottom =
        Math.min(
            rect.bottom,
            window.innerHeight
        );

    const visibleHeight =
        Math.max(
            0,
            visibleBottom - visibleTop
        );

    return visibleHeight / rect.height;

}


/* =========================================
   DESCOBRIR QUAL VÍDEO ESTÁ MAIS VISÍVEL
========================================= */

function findMostVisibleVideo() {

    let bestVideo = null;
    let bestPercentage = 0;

    videos.forEach((video) => {

        const percentage =
            getVisiblePercentage(video);

        if (percentage > bestPercentage) {

            bestPercentage = percentage;
            bestVideo = video;

        }

    });


    /*
       Quando pelo menos 35% do vídeo
       estiver visível, ele começa.
    */

    if (
        bestVideo &&
        bestPercentage >= 0.35
    ) {

        activateVideo(bestVideo);

    } else {

        /*
           Entrou numa parte da página
           sem vídeo.
        */

        if (activeVideo) {

            activeVideo.pause();
            activeVideo = null;

        }

    }

}


/* =========================================
   SCROLL
========================================= */

let scrollTimer = null;

window.addEventListener(
    "scroll",
    () => {

        clearTimeout(scrollTimer);

        scrollTimer = setTimeout(
            findMostVisibleVideo,
            50
        );

    },
    {
        passive: true
    }
);


/* =========================================
   RESIZE
========================================= */

window.addEventListener(
    "resize",
    findMostVisibleVideo
);


/* =========================================
   TROCA DE ABA
========================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (document.hidden) {

            videos.forEach((video) => {
                video.pause();
            });

        } else {

            findMostVisibleVideo();

        }

    }
);


/* =========================================
   CARREGAMENTO
========================================= */

window.addEventListener(
    "load",
    () => {

        setTimeout(
            findMostVisibleVideo,
            300
        );

    }
);