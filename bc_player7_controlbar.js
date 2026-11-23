videojs.registerPlugin('bc_player7_controlbar', function () {
    var player = this;
    var observer = null;
    var timeout = null;

    /*
     * A transcript exists only if the video has a metadata track
     * labelled "Description". Thumbnail tracks are also kind=metadata,
     * so the label check is required.
     */
    function hasDescriptionTrack() {
        var tracks = (player.mediainfo && player.mediainfo.text_tracks) || [];

        return tracks.some(function (track) {
            return track &&
                track.kind === 'metadata' &&
                typeof track.label === 'string' &&
                track.label.trim().toLowerCase() === 'description';
        });
    }

    /*
     * Toggle a class on the player. The CSS hides Transcript when the
     * class is present, even if the shared plugin re-inserts the button.
     */
    function updateTranscriptVisibility() {
        if (hasDescriptionTrack()) {
            player.removeClass('tvo-no-transcript');
        } else {
            player.addClass('tvo-no-transcript');
        }
    }

    function positionTranscriptButton() {
        var playerElement = player.el();

        if (!playerElement) {
            return false;
        }

        var transcriptButton = playerElement.querySelector(
            '.vjs-transcript-control'
        );

        var chromecastButton = playerElement.querySelector(
            '.vjs-chromecast-receiver-button'
        );

        if (!transcriptButton || !chromecastButton) {
            return false;
        }

        var controlBar = chromecastButton.parentNode;

        if (!controlBar) {
            return false;
        }

        /*
         * Move the actual Transcript button immediately before Chromecast.
         * This keeps keyboard/DOM order consistent with visual order.
         */
        if (transcriptButton.nextElementSibling !== chromecastButton) {
            controlBar.insertBefore(transcriptButton, chromecastButton);
        }

        return true;
    }

    // Re-check on every video load (covers playlists and video changes).
    player.on('loadstart', updateTranscriptVisibility);
    player.on('loadedmetadata', updateTranscriptVisibility);

    player.ready(function () {
        updateTranscriptVisibility();

        if (positionTranscriptButton()) {
            return;
        }

        observer = new MutationObserver(function () {
            if (positionTranscriptButton()) {
                observer.disconnect();
                observer = null;

                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
            }
        });

        observer.observe(player.el(), {
            childList: true,
            subtree: true
        });

        timeout = setTimeout(function () {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        }, 15000);
    });
});
