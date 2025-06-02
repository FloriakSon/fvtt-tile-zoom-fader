const MODULE_ID = "tile-zoom-fader";

const tilesToFade = [];

//Grabs the apparition of the Tile settings window
Hooks.on("renderTileConfig", (app, html, data) => {

    //Sets the setting flags
    const enableFade = app.object.getFlag(MODULE_ID, "enableFade") ?? false;
    const invertFade = app.object.getFlag(MODULE_ID, "invertFade") ?? false;
    const minFade = app.object.getFlag(MODULE_ID, "minFade") ?? 0;
    const maxFade = app.object.getFlag(MODULE_ID, "maxFade") ?? 1;

    // The module tile settings interface
    const injectHtml = 
    `<h3 class="form-header">${game.i18n.localize('TileZoomFader.settingsTitle')}</h3>
	<div class="form-group slim">
        <label>${game.i18n.localize('TileZoomFader.fade')}</label>
        <div class="form-fields">
            <label>${game.i18n.localize('TileZoomFader.enable')}</label>
            <input type="checkbox" name="flags.${MODULE_ID}.enableFade" ${enableFade ? 'checked' : ""}>
            <label>${game.i18n.localize('TileZoomFader.invert')}</label>
            <input type="checkbox" name="flags.${MODULE_ID}.invertFade" ${invertFade ? 'checked' : ""}>
        </div>
    </div>
    <div class="form-group slim">
        <label>${game.i18n.localize('TileZoomFader.zoom')}</label>
        <div class="form-fields">
            <label>${game.i18n.localize('TileZoomFader.zoomMin')}</label>
            <input type="number" value="${minFade}" step="any" name="flags.${MODULE_ID}.minFade" placeholder="">
            <label>${game.i18n.localize('TileZoomFader.zoomMax')}</label>
            <input type="number" value="${maxFade}" step="any" name="flags.${MODULE_ID}.maxFade" placeholder="">
        </div>
    </div>`;

    //Injects the interface in the window
    html.find('input[name="video.volume"]').closest(".form-group").after(injectHtml);
    app.setPosition({ height: auto });
});

//Saves the setting
Hooks.on("updateTile", (tile, updates) => {
    if (!tile.object) return;
    if ((updates?.flags?.[MODULE_ID] !== undefined || updates?.occlusion)) {
        const enableFade = app.object.getFlag(MODULE_ID, "enableFade") ?? false;
        const invertFade = app.object.getFlag(MODULE_ID, "invertFade") ?? false;
        const minFade = app.object.getFlag(MODULE_ID, "minFade") ?? 0;
        const maxFade = app.object.getFlag(MODULE_ID, "maxFade") ?? 1;
    }
});

Hooks.on("drawTile", (tile, layer, context) => {
    if ((tile.document.flags[MODULE_ID]?.enableFade)) {
        console.log("TILE-FAMODULE_IDDER | Ready to fade !");
        console.log(tile);
        tilesToFade.push(tile);
    }
});

function howManyTilesToFade() {
    console.log(tilesToFade.length);
}

//updates tile alpha on view movement
Hooks.on("canvasPan", function() {
    TileFader();
});

Hooks.on("refreshTile",(tile) => {
    TileFader();
});

// The magic function
function TileFader() {
    tilesToFade.forEach(element => {
        //Retrieves Target opacity setting
        let targetOpacity = element.document.alpha;
        // Retrieves view zoom
        let zoom = canvas.stage.worldTransform.a;
        console.log("tile-fade |","zoom :", zoom);
        //normalizes view zoom between 0 and 1
        let normalizedZoom =  (zoom - 1/3) / (3 - 1/3);
        const customZoom = (normalizedZoom - element.document.flags[MODULE_ID].minFade) / (element.document.flags[MODULE_ID].maxFade - element.document.flags[MODULE_ID].minFade);
        const clampedZoom = Math.min((Math.max(customZoom, 0), 1));

        if (element.document.flags[MODULE_ID].invertFade) {
            console.log("tile-fade | inverted !");
            const opacitycity = targetOpacity+customZoom;
            console.log("FADE_OPACITY |", opacitycity);
            //element.document.update({alpha: opacitycity});
            console.log(element.object);
            element.mesh.alpha = opacitycity;
        } else {
            console.log("tile-fade | not inverted !");
            const opacitycity = targetOpacity-customZoom;
            console.log("FADE_OPACITY |", opacitycity);
            element.mesh.alpha = opacitycity;
            //element.document.update({alpha: opacitycity});
        }

    });
};