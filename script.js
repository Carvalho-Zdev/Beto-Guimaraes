/* =========================================
   BETO GUIMARÃES 2040
   VÍDEOS AUTOMÁTICOS + ÁUDIO APÓS 1º TOQUE
========================================= */

const videos = document.querySelectorAll(".scroll-video");

let activeVideo = null;
let audioUnlocked = false;
let scrollTimer = null;


/* =========================================
   PAUSAR OS OUTROS VÍDEOS
========================================= */

function pauseOtherVideos(currentVideo) {

    videos.forEach((video) => {

        if (video !== currentVideo) {
            video.pause();
        }

    });

}


/* =========================================
   REPRODUZIR VÍDEO ATIVO
========================================= */

async function playActiveVideo(video) {

    if (!video) return;

    pauseOtherVideos(video);

    activeVideo = video;


    /*
       Depois do primeiro toque:
       áudio sempre ligado.
    */

    if (audioUnlocked) {

        video.muted = false;

        try {

            await video.play();

        } catch (error) {

            console.log(
                "O navegador bloqueou a reprodução:",
                error
            );

        }

        return;
    }


    /*
       Antes do primeiro toque:
       começa mudo porque os navegadores
       normalmente bloqueiam autoplay com áudio.
    */

    video.muted = true;

    try {

        await video.play();

    } catch (error) {

        console.log(
            "Autoplay bloqueado:",
            error
        );

    }

}


/* =========================================
   PRIMEIRO TOQUE LIBERA O ÁUDIO
========================================= */

function unlockAudio() {

    if (audioUnlocked) return;

    audioUnlocked = true;


    /*
       Garante que todos os próximos vídeos
       estarão configurados para usar áudio.
    */

    videos.forEach((video) => {
        video.muted = false;
    });


    /*
       Liga imediatamente o áudio
       do vídeo que está aparecendo.
    */

    if (activeVideo) {

        activeVideo.muted = false;

        activeVideo
            .play()
            .catch(() => {});

    }

}


/*
   pointerdown funciona com:
   mouse, toque e caneta.

   Basta UMA interação em qualquer
   lugar da página.
*/

document.addEventListener(
    "pointerdown",
    unlockAudio,
    { once: true }
);


/* =========================================
   CALCULAR VISIBILIDADE DO VÍDEO
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


    if (rect.height <= 0) {
        return 0;
    }


    return visibleHeight / rect.height;

}


/* =========================================
   DESCOBRIR O VÍDEO MAIS VISÍVEL
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
       35% visível:
       vídeo assume a reprodução.
    */

    if (
        bestVideo &&
        bestPercentage >= 0.35
    ) {

        if (
            activeVideo !== bestVideo ||
            bestVideo.paused
        ) {

            playActiveVideo(bestVideo);

        }

        return;

    }


    /*
       Nenhum vídeo está suficientemente
       visível = pausa o vídeo anterior.
    */

    if (activeVideo) {

        activeVideo.pause();

        activeVideo = null;

    }

}


/* =========================================
   SCROLL
========================================= */

window.addEventListener(
    "scroll",
    () => {

        clearTimeout(scrollTimer);


        scrollTimer = setTimeout(
            findMostVisibleVideo,
            40
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
   QUANDO SAI DA ABA
========================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (document.hidden) {

            videos.forEach((video) => {
                video.pause();
            });

            return;

        }


        findMostVisibleVideo();

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
            250
        );

    }
);