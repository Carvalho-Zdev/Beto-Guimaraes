/* =========================================
   BETO GUIMARÃES 2040

   VÍDEO ATIVO SEGUNDO O SCROLL
========================================= */


const videos =
    document.querySelectorAll(".scroll-video");


let activeVideo = null;

let userInteracted = false;

let scrollTimer = null;



/* =========================================
   PAUSA OS OUTROS VÍDEOS
========================================= */

function stopOtherVideos(currentVideo) {

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


    /*
       Se já é o vídeo ativo
       e já está tocando,
       não fazemos nada.
    */

    if (
        activeVideo === video &&
        !video.paused
    ) {

        return;

    }


    stopOtherVideos(video);


    activeVideo = video;


    /*
       Queremos áudio ligado.
    */

    video.muted = false;


    const playPromise =
        video.play();


    if (playPromise !== undefined) {

        playPromise.catch(() => {

            /*
               Alguns navegadores bloqueiam
               autoplay com áudio antes da
               primeira interação.

               Neste caso o vídeo começa mudo
               temporariamente.
            */

            video.muted = true;


            video
                .play()
                .catch(() => {});

        });

    }

}



/* =========================================
   LIBERAR ÁUDIO
========================================= */

function unlockAudio() {

    userInteracted = true;


    if (activeVideo) {

        activeVideo.muted = false;


        activeVideo
            .play()
            .catch(() => {});

    }

}



/* =========================================
   PRIMEIRA INTERAÇÃO
========================================= */

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
   CALCULA QUANTO DO VÍDEO
   ESTÁ VISÍVEL
========================================= */

function getVisiblePercentage(video) {

    const rect =
        video.getBoundingClientRect();


    const visibleTop =
        Math.max(
            rect.top,
            0
        );


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


    return (
        visibleHeight /
        rect.height
    );

}



/* =========================================
   DESCOBRE QUAL VÍDEO
   ESTÁ MAIS VISÍVEL
========================================= */

function findMostVisibleVideo() {

    let bestVideo = null;

    let bestPercentage = 0;


    videos.forEach((video) => {

        const percentage =
            getVisiblePercentage(video);


        if (
            percentage >
            bestPercentage
        ) {

            bestPercentage =
                percentage;

            bestVideo =
                video;

        }

    });


    /*
       Se pelo menos 35% de um vídeo
       estiver visível, ele assume.
    */

    if (
        bestVideo &&
        bestPercentage >= 0.35
    ) {

        activateVideo(
            bestVideo
        );

    }

    else {

        /*
           Estamos em uma área de texto
           sem vídeo suficientemente visível.
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

window.addEventListener(
    "scroll",
    () => {

        clearTimeout(
            scrollTimer
        );


        scrollTimer =
            setTimeout(
                findMostVisibleVideo,
                50
            );

    },
    {
        passive: true
    }
);



/* =========================================
   TAMANHO DA TELA
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

            videos.forEach(
                (video) => {

                    video.pause();

                }
            );

        }

        else {

            findMostVisibleVideo();

        }

    }
);



/* =========================================
   CARREGAMENTO INICIAL
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