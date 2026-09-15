/* =========================================
   BETO GUIMARÃES 2040
   SISTEMA AUTOMÁTICO DE VÍDEOS
========================================= */

const videos = document.querySelectorAll(".scroll-video");
const soundButtons = document.querySelectorAll(".sound-button");

let activeVideo = null;
let soundEnabled = false;


/* =========================================
   ATUALIZA BOTÕES
========================================= */

function updateSoundButtons() {

    soundButtons.forEach((button) => {

        const text =
            button.querySelector(".sound-text");

        if (!text) return;


        if (soundEnabled) {

            text.textContent =
                "SOM ATIVADO";

        } else {

            text.textContent =
                "ATIVAR SOM";

        }

    });

}


/* =========================================
   PAUSA TODOS OS OUTROS
========================================= */

function pauseOtherVideos(currentVideo) {

    videos.forEach((video) => {

        if (video !== currentVideo) {

            video.pause();

            video.muted = true;

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


    video.muted = !soundEnabled;


    const promise =
        video.play();


    if (promise !== undefined) {

        promise.catch(() => {

            /*
            Se o navegador bloquear
            autoplay com áudio,
            começa sem áudio.
            */

            video.muted = true;

            video.play().catch(() => {});

        });

    }

}


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
            visibleHeight / rect.height;


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
   ATIVAR / DESATIVAR SOM
========================================= */

soundButtons.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            soundEnabled =
                !soundEnabled;


            /*
            Se temos um vídeo ativo,
            muda o som imediatamente.
            */

            if (activeVideo) {

                activeVideo.muted =
                    !soundEnabled;


                activeVideo
                    .play()
                    .catch(() => {});

            }


            updateSoundButtons();

        }
    );

});


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

updateSoundButtons();


window.addEventListener(
    "load",
    () => {

        setTimeout(
            findMostVisibleVideo,
            300
        );

    }
);