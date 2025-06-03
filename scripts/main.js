const MODULE_ID = "tile-zoom-fader";

let tilesToFade = [];

// double precaution to start the array fresh each page refresh
Hooks.once("setup", function() {
    tilesToFade = [];
});

//Grabs the apparition of the Tile settings window
Hooks.on("renderTileConfig", (app, html, data) => {

    //Sets the setting flags
    const enableFade = app.object.getFlag("tile-zoom-fader", "enableFade") ?? false;
    const invertFade = app.object.getFlag("tile-zoom-fader", "invertFade") ?? false;
    const minFade = app.object.getFlag("tile-zoom-fader", "minFade") ?? 0;
    const maxFade = app.object.getFlag("tile-zoom-fader", "maxFade") ?? 1;

    // The module tile settings interface
    const injectHtml = 
    `<h3 class="form-header">${game.i18n.localize('TileZoomFader.settingsTitle')}</h3>
	<div class="form-group slim">
        <label>${game.i18n.localize('TileZoomFader.fade')}</label>
        <div class="form-fields">
            <label>${game.i18n.localize('TileZoomFader.enable')}</label>
            <input type="checkbox" name="flags.${"tile-zoom-fader"}.enableFade" ${enableFade ? 'checked' : ""}>
            <label>${game.i18n.localize('TileZoomFader.invert')}</label>
            <input type="checkbox" name="flags.${"tile-zoom-fader"}.invertFade" ${invertFade ? 'checked' : ""}>
        </div>
    </div>
    <div class="form-group slim">
        <label>${game.i18n.localize('TileZoomFader.zoom')}</label>
        <div class="form-fields">
            <label>${game.i18n.localize('TileZoomFader.zoomMin')}</label>
            <input type="number" value="${minFade}" step="any" name="flags.${"tile-zoom-fader"}.minFade" placeholder="0" min="0" max="1">
            <label>${game.i18n.localize('TileZoomFader.zoomMax')}</label>
            <input type="number" value="${maxFade}" step="any" name="flags.${"tile-zoom-fader"}.maxFade" placeholder="1" min ="0" max="1">
        </div>
    </div>`;

    //Injects the interface in the window
    html.find('input[name="video.volume"]').closest(".form-group").after(injectHtml);
    //app.setPosition({ height: auto });
});

//Initial gathering of enabled tiles and fade application
Hooks.on("drawTile", (tile, layer, context) => {
    if ((tile.document.flags["tile-zoom-fader"]?.enableFade)) {
        tilesToFade.push(tile);
    }
});

//updates tile alpha on view movement
Hooks.on("canvasPan", function() {
    TileFader();
});

//keeps tracks of tiles to fade or not and calls the fading
Hooks.on("refreshTile",(tile) => {
    if ((tile.document.flags["tile-zoom-fader"]?.enableFade)) {
        tilesToFade.push(tile);
    } else {
        const getIndex = tilesToFade.indexOf(tile);
        if ( getIndex !== -1) {
            tilesToFade.splice(getIndex);
        }
    }
    TileFader();
});

// The magic function
function TileFader() {
    tilesToFade.forEach(element => {
        console.log(element.document);
        //Retrieves Target opacity setting
        let targetOpacity = element.document.alpha;
        // Retrieves view zoom
        let zoom = canvas.stage.worldTransform.a;
        //normalizes view zoom between 0 and 1
        let normalizedZoom =  (zoom - 1/3) / (3 - 1/3);
        const customZoom = (normalizedZoom - element.document.flags["tile-zoom-fader"].minFade) / (element.document.flags["tile-zoom-fader"].maxFade - element.document.flags["tile-zoom-fader"].minFade);
        const clampedZoom = Math.min((Math.max(customZoom, 0), 1));

        if (element.document.flags["tile-zoom-fader"].invertFade) {
            const newOpacity = Math.min(0+customZoom, targetOpacity);
            element.mesh.alpha = newOpacity;
        } else {
            const newOpacity = targetOpacity-customZoom;
            element.mesh.alpha = newOpacity;
        }

    });
};
