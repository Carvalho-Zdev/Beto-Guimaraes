/* =========================================
   BETO GUIMARÃES 2040
   SISTEMA AUTOMÁTICO DE VÍDEOS
========================================= */

const videos = document.querySelectorAll(".scroll-video");
const soundButtons = document.querySelectorAll(".sound-button");

let activeVideo = null;
let soundEnabled = false;


/* =========================================
   ESCONDE OS BOTÕES DE SOM
========================================= */

soundButtons.forEach((button) => {
    button.style.display = "none";
});


/* =========================================
   PAUSA TODOS OS OUTROS
========================================= */

function pauseOtherVideos(currentVideo) {

    videos.forEach((video) => {

        if (video !== currentVideo) {

            video.pause();

        }

    });

}


/* =========================================
   ATIVA UM VÍDEO
========================================= */

function activateVideo(video) {

    if (!video) return;

    pauseOtherVideos(video);

    activeVideo = video;


    /*
       Antes da primeira interação:
       começa mudo para permitir autoplay.

       Depois da primeira interação:
       entra com áudio.
    */

    video.muted = !soundEnabled;


    const promise = video.play();


    if (promise !== undefined) {

        promise.catch(() => {

            /*
               Se o navegador ainda bloquear
               a reprodução com áudio,
               tenta iniciar mudo.
            */

            video.muted = true;

            video.play().catch(() => {});

        });

    }

}


/* =========================================
   PRIMEIRO TOQUE / CLIQUE LIBERA O SOM
========================================= */

function unlockSound() {

    if (soundEnabled) return;

    soundEnabled = true;


    /*
       O vídeo que estiver ativo
       recebe áudio imediatamente.
    */

    if (activeVideo) {

        activeVideo.muted = false;

        activeVideo
            .play()
            .catch(() => {});

    }

}


/*
   Um único toque/clique em qualquer
   lugar da página libera o áudio.

   pointerdown funciona com:
   - mouse
   - touchscreen
   - caneta
*/

document.addEventListener(
    "pointerdown",
    unlockSound,
    { once: true }
);


/*
   Fallback específico para alguns
   navegadores móveis.
*/

document.addEventListener(
    "touchstart",
    unlockSound,
    {
        once: true,
        passive: true
    }
);


/* =========================================
   ENCONTRA O VÍDEO MAIS VISÍVEL
========================================= */

function findMostVisibleVideo() {

    let bestVideo = null;

    let bestVisibleAmount = 0;


    videos.forEach((video) => {

        const rect =
            video.getBoundingClientRect();


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


        const percentage =
            rect.height > 0
                ? visibleHeight / rect.height
                : 0;


        if (
            percentage > bestVisibleAmount
        ) {

            bestVisibleAmount =
                percentage;

            bestVideo =
                video;

        }

    });


    /*
       Só troca quando pelo menos
       35% do vídeo estiver visível.
    */

    if (
        bestVideo &&
        bestVisibleAmount >= 0.35
    ) {

        if (
            activeVideo !== bestVideo
        ) {

            activateVideo(bestVideo);

        }

    } else {

        /*
           Nenhum vídeo suficientemente
           visível = pausa.
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


        scrollTimer =
            setTimeout(
                findMostVisibleVideo,
                60
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
   PAUSA SE SAIR DA ABA
========================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (document.hidden) {

            videos.forEach(
                (video) => {
                    video.pause();
                }
            );

        } else {

            findMostVisibleVideo();

        }

    }
);


/* =========================================
   INÍCIO
========================================= */

window.addEventListener(
    "load",
    () => {

        /*
           Inicialmente os vídeos ficam
           preparados para autoplay mudo.
        */

        videos.forEach((video) => {
            video.muted = true;
        });


        setTimeout(
            findMostVisibleVideo,
            300
        );

    }
);